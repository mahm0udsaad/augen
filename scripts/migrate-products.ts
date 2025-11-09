/**
 * Migration script to populate Supabase with existing products
 * Run this once to migrate your initial product data
 * 
 * Usage: npx tsx scripts/migrate-products.ts
 */

import { createProduct } from '../lib/product-service'
import { products } from '../lib/products'

async function migrateProducts() {
  console.log('🚀 Starting product migration...')
  console.log(`📦 Found ${products.length} products to migrate`)

  let successCount = 0
  let errorCount = 0

  for (const product of products) {
    try {
      // Remove the id field so Supabase generates a new UUID
      const { id, ...productWithoutId } = product
      
      await createProduct(productWithoutId)
      successCount++
      console.log(`✅ Migrated: ${product.name}`)
    } catch (error) {
      errorCount++
      console.error(`❌ Failed to migrate ${product.name}:`, error)
    }
  }

  console.log('\n📊 Migration Summary:')
  console.log(`✅ Successfully migrated: ${successCount}`)
  console.log(`❌ Failed: ${errorCount}`)
  console.log('✨ Migration complete!')
}

// Run migration
migrateProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  })

