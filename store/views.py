# store/views.py - Add this import at the top
from datetime import timedelta
from django.shortcuts import render, get_object_or_404, redirect
from django.db.models import Q
from django.core.paginator import Paginator
from django.contrib import messages
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import timedelta  # Add this!
import json
import random
import razorpay
from .models import Product, Category, Customer, Order
from django.conf import settings

# Initialize Razorpay Client
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)

def home(request):
    """Home page - 1 product per category"""
    categories = Category.objects.all()
    
    trending_products = []
    for category in categories:
        product = Product.objects.filter(category=category, stock__gt=0).first()
        if product:
            trending_products.append(product)
    
    random.shuffle(trending_products)
    
    context = {
        'categories': categories,
        'trending_products': trending_products,
    }
    return render(request, 'store/index.html', context)

def shop(request):
    products = Product.objects.filter(stock__gt=0)
    search = request.GET.get('search')
    if search:
        products = products.filter(Q(name__icontains=search) | Q(description__icontains=search))
    products = list(products)
    random.shuffle(products)
    paginator = Paginator(products, 12)
    page = request.GET.get('page')
    products = paginator.get_page(page)
    return render(request, 'store/shop.html', {'products': products, 'categories': Category.objects.all()})

def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug)
    related = list(Product.objects.filter(category=product.category).exclude(id=product.id))
    random.shuffle(related)
    return render(request, 'store/product.html', {'product': product, 'related_products': related[:4]})
def category_products(request, slug):
    category = get_object_or_404(Category, slug=slug)

    products = Product.objects.filter(
        category=category,
        stock__gt=0
    )

    return render(
        request,
        'store/category_products.html',
        {
            'category': category,
            'products': products
        }
    )
@csrf_exempt
def add_to_cart(request):
    if request.method == 'POST':
        try:
            cart_data = json.loads(request.body)
            request.session['lumiere_cart_data'] = cart_data
            return JsonResponse({'status': 'success'})
        except:
            pass
    return JsonResponse({'status': 'ok'})

def cart(request):
    return render(request, 'store/cart.html')

def checkout(request):
    cart_data = request.session.get('lumiere_cart_data', [])
    
    if request.method == 'POST':
        if not cart_data:
            messages.error(request, 'Your cart is empty!')
            return redirect('shop')
        
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        address = request.POST.get('address')
        city = request.POST.get('city')
        state = request.POST.get('state')
        pincode = request.POST.get('pincode')
        payment_method = request.POST.get('payment')
        
        customer, created = Customer.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'phone': phone,
                'address': address,
                'city': city,
                'state': state,
                'pincode': pincode,
            }
        )
        
        if not created:
            customer.first_name = first_name
            customer.last_name = last_name
            customer.phone = phone
            customer.address = address
            customer.city = city
            customer.state = state
            customer.pincode = pincode
            customer.save()
        
        total_price = sum(item['price'] * item['quantity'] for item in cart_data)
        total_paise = int(total_price * 100)
        
        import uuid
        unique_id = uuid.uuid4().hex.upper()[:8]
        order_id = "LUM" + unique_id
        
        if payment_method == 'cod':
            # Cash on Delivery
            for item in cart_data:
                Order.objects.create(
                    order_id=order_id,
                    customer=customer,
                    product_name=item['name'],
                    product_price=item['price'],
                    quantity=item['quantity'],
                    color=item.get('color', 'Default'),
                    size=item.get('size', 'Default'),
                    product_image=item.get('image', ''),
                    total_price=item['price'] * item['quantity'],
                    payment_method='cod',
                    payment_status='Pending',
                    status='Confirmed',
                    delivery_date=timezone.now() + timedelta(days=5)
                )
            
            request.session['lumiere_cart_data'] = []
            request.session['last_order_id'] = order_id
            messages.success(request, 'Order placed successfully!')
            return redirect('order_confirmation')

        
        else:
            # Online Payment
            razorpay_order = razorpay_client.order.create({
                'amount': total_paise,
                'currency': 'INR',
                'receipt': order_id,
                'payment_capture': 1
            })
            
            request.session['razorpay_order_id'] = razorpay_order['id']
            request.session['lumiere_order_id'] = order_id
            request.session['customer_data'] = {
                'first_name': first_name,
                'last_name': last_name,
                'email': email,
                'phone': phone,
                'address': address,
                'city': city,
                'state': state,
                'pincode': pincode,
            }
            
            context = {
                'razorpay_order_id': razorpay_order['id'],
                'amount': total_price,
                'amount_paise': total_paise,
                'name': f"{first_name} {last_name}",
                'email': email,
                'phone': phone,
                'razorpay_key_id': settings.RAZORPAY_KEY_ID,
            }
            return render(request, 'store/razorpay_payment.html', context)
    
    total_price = sum(item['price'] * item['quantity'] for item in cart_data) if cart_data else 0
    return render(request, 'store/checkout.html', {'cart': cart_data, 'total_price': total_price})

@csrf_exempt
def razorpay_success(request):
    if request.method == 'POST':
        try:
            order_id = request.session.get('lumiere_order_id')
            customer_data = request.session.get('customer_data')
            cart_data = request.session.get('lumiere_cart_data', [])
            
            customer = Customer.objects.get(email=customer_data['email'])
            
            for item in cart_data:
                Order.objects.create(
                    order_id=order_id,
                    customer=customer,
                    product_name=item['name'],
                    product_price=item['price'],
                    quantity=item['quantity'],
                    color=item.get('color', 'Default'),
                    size=item.get('size', 'Default'),
                    product_image=item.get('image', ''),
                    total_price=item['price'] * item['quantity'],
                    payment_method='online',
                    payment_status='Paid',
                    status='Confirmed',
                    delivery_date=timezone.now() + timedelta(days=5)
                )
            
            request.session['lumiere_cart_data'] = []
            request.session['lumiere_order_id'] = ''
            request.session['razorpay_order_id'] = ''
            request.session['customer_data'] = {}
            request.session['last_order_id'] = order_id
            
            messages.success(request, 'Payment successful!')
            return redirect('order-confirmation')
            
        except Exception as e:
            messages.error(request, f'Payment error: {str(e)}')
            return redirect('shop')
    
    return redirect('shop')

def order_confirmation(request):  # With underscore
    order_id = request.session.get('last_order_id')
    if not order_id:
        return redirect('shop')
    orders = Order.objects.filter(order_id=order_id)
    return render(request, 'store/order_confirmation.html', {
        'order_id': order_id, 
        'orders': orders
    })

def about(request):
    return render(request, 'store/about.html')


def contact(request):
    return render(request, 'store/contact.html')