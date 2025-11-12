'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, ArrowRight, X } from 'lucide-react'
import { useVideoCreateStore } from '../../../../store/useVideoCreateStore'
import { useThemeStore } from '../../../../store/useThemeStore'
import ProductGrid from '../../../../components/ProductGrid'
import StepIndicator from '../../../../components/StepIndicator'

// 인기 제품 더미 데이터
const popularProducts = [
  { id: 'pop1', name: '무선 이어폰', views: 12500, rank: 1 },
  { id: 'pop2', name: '스마트워치', views: 9800, rank: 2 },
  { id: 'pop3', name: '블루투스 스피커', views: 8700, rank: 3 },
  { id: 'pop4', name: '노트북 스탠드', views: 7200, rank: 4 },
  { id: 'pop5', name: '무선 마우스', views: 6500, rank: 5 },
]

export default function Step1Page() {
  const router = useRouter()
  const { selectedProducts, removeProduct } = useVideoCreateStore()
  const theme = useThemeStore((state) => state.theme)
  const [draggedProduct, setDraggedProduct] = useState<any>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('application/json')
    if (data) {
      const product = JSON.parse(data)
      setDraggedProduct(product)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleNext = () => {
    if (selectedProducts.length > 0) {
      router.push('/video/create/step2')
    }
  }

  return (
    <div className="flex h-screen">
      <StepIndicator />
      {/* 왼쪽 영역 - 상품 미리보기 및 인기 제품 */}
      <div className="flex-1 ml-48 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            상품 선택
          </h1>
          <p className={`mb-8 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            영상에 사용할 상품을 선택하세요
          </p>

          {/* 인기 제품 순위 */}
          <div className={`mb-8 rounded-lg shadow-sm border p-6 ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className={`w-5 h-5 ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`} />
              <h2 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                인기 제품 순위
              </h2>
            </div>
            <div className="space-y-3">
              {popularProducts.map((product) => (
                <div
                  key={product.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      product.rank <= 3
                        ? 'bg-purple-500 text-white'
                        : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {product.rank}
                    </div>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {product.name}
                    </span>
                  </div>
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {product.views.toLocaleString()}회
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 드래그 앤 드롭 영역 */}
          <div className={`mb-8 rounded-lg shadow-sm border p-6 ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              선택된 상품
            </h2>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`min-h-[200px] rounded-lg border-2 border-dashed p-4 ${
                theme === 'dark'
                  ? 'border-gray-700 bg-gray-900/50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              {selectedProducts.length === 0 ? (
                <div className={`text-center py-8 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  오른쪽에서 상품을 드래그하거나 클릭하여 추가하세요
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-900 border-gray-700'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                        <div>
                          <h3 className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {product.name}
                          </h3>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {product.price.toLocaleString()}원
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 다음 단계 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={selectedProducts.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedProducts.length === 0
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              <span>다음 단계</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 오른쪽 영역 - 상품 그리드 */}
      <div className="w-96 border-l">
        <ProductGrid />
      </div>
    </div>
  )
}

