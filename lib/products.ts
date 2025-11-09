export interface Product {
  id: string
  name: string
  style: string
  price: number
  quantity?: number
  image: string
  description: string
  material: string
  color: string
  colorOptions?: Array<{ name: string; hex: string }>
  category?: string
  category_id?: string
  subcategory_id?: string
}

export const products: Product[] = [
  {
    id: "1",
    name: "Classic Gold Oval",
    style: "Oval Frame",
    price: 299,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-31%20at%2000.47.40-OMpcMECwsIpth082vv33SPPd8QQoNZ.jpeg",
    description: "Timeless oval frames with elegant gold accents and clear lenses",
    material: "Titanium & Gold Plated",
    color: "Gold with Black Accents",
    category: "classic",
    colorOptions: [
      { name: "Gold", hex: "#D4AF37" },
      { name: "Black", hex: "#1a1a1a" },
      { name: "Silver", hex: "#C0C0C0" },
    ],
  },
  {
    id: "2",
    name: "Tortoiseshell Luxury",
    style: "Oval Frame",
    price: 349,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-31%20at%2000.47.39-SdnODS8G6eHeoYyYDhLgvqg8OPqxCS.jpeg",
    description: "Premium tortoiseshell with gold bridge and luxury packaging",
    material: "Acetate & Gold Plated",
    color: "Tortoiseshell with Gold",
    category: "luxury",
    colorOptions: [
      { name: "Tortoiseshell", hex: "#8B4513" },
      { name: "Gold", hex: "#D4AF37" },
      { name: "Brown", hex: "#654321" },
    ],
  },
  {
    id: "3",
    name: "Modern Sunglasses",
    style: "Oval Sunglasses",
    price: 329,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-31%20at%2000.47.41%20%281%29-WYgtALxEbKVlNKbM6sbl0M2X01dbp7.jpeg",
    description: "Sleek oval sunglasses with dark lenses and gold frame",
    material: "Titanium & Gold Plated",
    color: "Gold with Black Lenses",
    category: "sunglasses",
    colorOptions: [
      { name: "Gold", hex: "#D4AF37" },
      { name: "Black", hex: "#1a1a1a" },
      { name: "Rose Gold", hex: "#B76E79" },
    ],
  },
  {
    id: "4",
    name: "Detailed Bridge",
    style: "Oval Frame",
    price: 319,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-31%20at%2000.47.40%20%281%29-jFRFc2XI7TWFq6vG4LEu4pxALg8pb7.jpeg",
    description: "Intricate gold detailing with purple temple arms",
    material: "Titanium & Gold Plated",
    color: "Gold with Purple Accents",
    category: "classic",
    colorOptions: [
      { name: "Gold", hex: "#D4AF37" },
      { name: "Purple", hex: "#9370DB" },
      { name: "Black", hex: "#1a1a1a" },
    ],
  },
  {
    id: "5",
    name: "Purple Accent Frame",
    style: "Oval Frame",
    price: 289,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-31%20at%2000.47.40%20%282%29-q0CL949carNDGe8pssV57KiS4TM6wa.jpeg",
    description: "Elegant oval frame with purple temple arms and gold bridge",
    material: "Titanium & Gold Plated",
    color: "Gold with Purple",
    category: "classic",
    colorOptions: [
      { name: "Purple", hex: "#9370DB" },
      { name: "Gold", hex: "#D4AF37" },
      { name: "Silver", hex: "#C0C0C0" },
    ],
  },
  {
    id: "6",
    name: "Luxury Oval Classic",
    style: "Oval Frame",
    price: 359,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-31%20at%2000.47.41%20%282%29-V6VADweTz56asczilKq0eYXHIZq4K7.jpeg",
    description: "Premium tortoiseshell with gold accents in luxury packaging",
    material: "Acetate & Gold Plated",
    color: "Tortoiseshell with Gold",
    category: "luxury",
    colorOptions: [
      { name: "Tortoiseshell", hex: "#8B4513" },
      { name: "Gold", hex: "#D4AF37" },
      { name: "Cognac", hex: "#8B4513" },
    ],
  },
  {
    id: "7",
    name: "Gold Detailed Frame",
    style: "Oval Frame",
    price: 339,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-31%20at%2000.47.40%20%283%29-G8BJ4yRZXntdwRncw6u1mygnH6VaoR.jpeg",
    description: "Sophisticated oval frame with intricate gold detailing",
    material: "Titanium & Gold Plated",
    color: "Gold with Black",
    category: "luxury",
    colorOptions: [
      { name: "Gold", hex: "#D4AF37" },
      { name: "Black", hex: "#1a1a1a" },
      { name: "Rose Gold", hex: "#B76E79" },
    ],
  },
  {
    id: "8",
    name: "Purple Temple Oval",
    style: "Oval Frame",
    price: 299,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-31%20at%2000.47.41%20%283%29-DJ70XheBWZrv2nl6iQGX131ybsam7w.jpeg",
    description: "Refined oval frame with purple temple arms and gold bridge",
    material: "Titanium & Gold Plated",
    color: "Gold with Purple",
    category: "classic",
    colorOptions: [
      { name: "Purple", hex: "#9370DB" },
      { name: "Gold", hex: "#D4AF37" },
      { name: "Black", hex: "#1a1a1a" },
    ],
  },
  {
    id: "9",
    name: "Premium Oval Luxury",
    style: "Oval Frame",
    price: 369,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-31%20at%2000.47.40%20%284%29-FUddOO8aJIHVZcFrswraCruppLWYGb.jpeg",
    description: "Exquisite oval frame with premium materials and luxury presentation",
    material: "Titanium & Gold Plated",
    color: "Gold with Tortoiseshell",
    category: "luxury",
    colorOptions: [
      { name: "Gold", hex: "#D4AF37" },
      { name: "Tortoiseshell", hex: "#8B4513" },
      { name: "Rose Gold", hex: "#B76E79" },
    ],
  },
  {
    id: "10",
    name: "Signature Gold Oval",
    style: "Oval Frame",
    price: 309,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-10-31%20at%2000.47.41%20%284%29-4LxXadayYbi5oUUhEsURXgP51PZYRE.jpeg",
    description: "Signature collection oval frame with detailed gold work",
    material: "Titanium & Gold Plated",
    color: "Gold with Purple Accents",
    category: "classic",
    colorOptions: [
      { name: "Gold", hex: "#D4AF37" },
      { name: "Purple", hex: "#9370DB" },
      { name: "Silver", hex: "#C0C0C0" },
    ],
  },
]
