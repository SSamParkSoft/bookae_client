import { NextResponse } from 'next/server'
import { Product } from '@/lib/types/viewer'

// 더미 제품 데이터 (bookae_creator 구조 참고)
const generateDummyProducts = (channelId: string): Product[] => {
  const products: Product[] = [
    {
      id: '1',
      productId: 1234567,
      name: '[모노마트] 와후카레 중간 맛(레토르트) 1kg',
      price: 7200,
      image: 'https://via.placeholder.com/200/f59e0b/ffffff?text=카레',
      thumbnailUrl: 'https://via.placeholder.com/200/f59e0b/ffffff?text=카레',
      description: '(냄새도) 이야 진짜 비주얼',
      order: 1,
    },
    {
      id: '2',
      productId: 1234568,
      name: '[모노마트] 다이쇼 마파두부소스(마라소스) 1.16kg',
      price: 15200,
      image: 'https://via.placeholder.com/200/ef4444/ffffff?text=마파두부',
      thumbnailUrl: 'https://via.placeholder.com/200/ef4444/ffffff?text=마파두부',
      description: '진은 상식당 염치는',
      order: 2,
    },
    {
      id: '3',
      productId: 1234569,
      name: '등심 돈까스 800g (100g*8ea)',
      price: 16600,
      image: 'https://via.placeholder.com/200/10b981/ffffff?text=돈까스',
      thumbnailUrl: 'https://via.placeholder.com/200/10b981/ffffff?text=돈까스',
      description: '진심 돈까스 맛집 정도로 맛있음',
      order: 3,
    },
    {
      id: '4',
      productId: 1234570,
      name: '빵가루 새우 튀김(헤드 OFF) 450g(45g*10ea)',
      price: 6800,
      image: 'https://via.placeholder.com/200/3b82f6/ffffff?text=새우',
      thumbnailUrl: 'https://via.placeholder.com/200/3b82f6/ffffff?text=새우',
      description: '개당 700원도 안함',
      order: 4,
    },
    {
      id: '5',
      productId: 1234571,
      name: '와후 치킨가라아게 1kg',
      price: 12500,
      image: 'https://via.placeholder.com/200/f97316/ffffff?text=치킨',
      thumbnailUrl: 'https://via.placeholder.com/200/f97316/ffffff?text=치킨',
      description: '이자카야 가라아케 맛을 집에서 느낄 수 있음',
      order: 5,
    },
    {
      id: '6',
      productId: 1234572,
      name: '고구마 치즈 고로케 720g(40g*18ea)',
      price: 11500,
      image: 'https://via.placeholder.com/200/a855f7/ffffff?text=고로케',
      thumbnailUrl: 'https://via.placeholder.com/200/a855f7/ffffff?text=고로케',
      description: '진심 싫어할 수가 없는 맛!!',
      order: 6,
    },
  ]

  return products
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    const { channelId } = await params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    // 제품 목록 생성 (추후 실제 API 연동)
    let products = generateDummyProducts(channelId)

    // 검색 필터링
    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('제품 목록 API 오류:', error)
    return NextResponse.json(
      { error: '제품 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

