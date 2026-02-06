import { getUncachableStripeClient } from './stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();
  
  console.log('Creating ProCam+ subscription product...');

  // Check if product already exists
  const existingProducts = await stripe.products.search({ 
    query: "name:'ProCam+'" 
  });
  
  if (existingProducts.data.length > 0) {
    console.log('ProCam+ product already exists:', existingProducts.data[0].id);
    
    // Check for existing prices
    const existingPrices = await stripe.prices.list({
      product: existingProducts.data[0].id,
      active: true
    });
    
    console.log('Existing prices:');
    existingPrices.data.forEach(price => {
      const amount = price.unit_amount ? price.unit_amount / 100 : 0;
      const interval = price.recurring?.interval || 'one-time';
      console.log(`  - ${price.id}: $${amount}/${interval}`);
    });
    
    return;
  }

  // Create the ProCam+ product
  const product = await stripe.products.create({
    name: 'ProCam+',
    description: 'Unlock professional camera features: 85mm Portrait lens, RAW capture, and unlimited cloud storage.',
    metadata: {
      tier: 'pro',
      features: '85mm_lens,raw_capture,unlimited_storage,priority_support'
    }
  });
  
  console.log('Created product:', product.id);

  // Create monthly price - $9.99/month
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 999, // $9.99 in cents
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: {
      plan: 'monthly'
    }
  });
  
  console.log('Created monthly price:', monthlyPrice.id, '- $9.99/month');

  // Create yearly price - $79.99/year (save ~33%)
  const yearlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 7999, // $79.99 in cents
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: {
      plan: 'yearly',
      savings: '33%'
    }
  });
  
  console.log('Created yearly price:', yearlyPrice.id, '- $79.99/year');

  console.log('\n✅ Products created successfully!');
  console.log('\nSubscription Tiers:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('FREE TIER:');
  console.log('  • Basic camera controls (14mm-50mm lenses)');
  console.log('  • JPEG capture only');
  console.log('  • 50 photo storage limit');
  console.log('');
  console.log('PROCAM+ ($9.99/mo or $79.99/yr):');
  console.log('  • All lenses including 85mm Portrait');
  console.log('  • RAW capture format');
  console.log('  • Unlimited cloud storage');
  console.log('  • Priority support');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

createProducts().catch(console.error);
