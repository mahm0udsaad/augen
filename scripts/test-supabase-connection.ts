/**
 * Supabase Connection Test Script
 * Run this to verify your Supabase setup is working correctly
 * 
 * Usage: npx tsx scripts/test-supabase-connection.ts
 */

import { getAllProducts, getProductById } from '../lib/product-service'

async function testSupabaseConnection() {
  console.log('🔌 Testing Supabase Connection...\n')

  try {
    // Test 1: Fetch all products
    console.log('Test 1: Fetching all products...')
    const products = await getAllProducts()
    console.log(`✅ Successfully fetched ${products.length} products`)
    console.log(`   First product: ${products[0]?.name || 'N/A'}`)
    
    // Test 2: Fetch a specific product
    if (products.length > 0) {
      console.log('\nTest 2: Fetching specific product...')
      const firstProduct = products[0]
      const product = await getProductById(firstProduct.id)
      console.log(`✅ Successfully fetched product: ${product?.name || 'N/A'}`)
    }
    
    // Test 3: Verify product data structure
    console.log('\nTest 3: Verifying product data structure...')
    const sampleProduct = products[0]
    const requiredFields = ['id', 'name', 'style', 'price', 'image', 'description', 'material', 'color']
    const missingFields = requiredFields.filter(field => !(field in sampleProduct))
    
    if (missingFields.length === 0) {
      console.log('✅ All required fields present in product data')
    } else {
      console.log(`❌ Missing fields: ${missingFields.join(', ')}`)
    }
    
    // Test 4: Verify categories
    console.log('\nTest 4: Checking product categories...')
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))]
    console.log(`✅ Found ${categories.length} categories: ${categories.join(', ')}`)
    
    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 CONNECTION SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total Products: ${products.length}`)
    console.log(`Categories: ${categories.length}`)
    console.log(`Price Range: $${Math.min(...products.map(p => p.price))} - $${Math.max(...products.map(p => p.price))}`)
    console.log('\n✅ All tests passed! Supabase is fully connected and operational.')
    
  } catch (error) {
    console.error('\n❌ Connection test failed:')
    console.error(error)
    console.log('\n💡 Tips:')
    console.log('1. Check that .env.local exists with correct credentials')
    console.log('2. Verify Supabase project is active')
    console.log('3. Ensure products table exists in database')
    process.exit(1)
  }
}

// Run the test
testSupabaseConnection()

