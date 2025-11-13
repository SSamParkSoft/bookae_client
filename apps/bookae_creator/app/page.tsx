'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useCoupangStats } from '@/lib/hooks/useCoupangStats'
import { useYouTubeVideos } from '@/lib/hooks/useYouTubeVideos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useThemeStore } from '@/store/useThemeStore'
import { TrendingUp, ShoppingCart, Eye, Loader2, Youtube } from 'lucide-react'

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(num)
}

export default function HomePage() {
  const { data: coupangData, isLoading: coupangLoading } = useCoupangStats()
  const { data: youtubeVideos, isLoading: youtubeLoading } = useYouTubeVideos()
  const theme = useThemeStore((state) => state.theme)

  // 금주의 핫 키워드 (카테고리별 주문 수 집계)
  const hotKeywords = useMemo(() => {
    if (!coupangData?.dailyOrders) return []
    
    const categoryCount: Record<string, number> = {}
    coupangData.dailyOrders.forEach((order) => {
      const category = order.categoryName
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })

    return Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [coupangData])

  // 가장 많이 팔린 상품 TOP 5
  const topProducts = useMemo(() => {
    if (!coupangData?.dailyOrders) return []
    
    const productMap: Record<string, { name: string; orderCount: number; totalGmv: number; totalCommission: number }> = {}
    
    coupangData.dailyOrders.forEach((order) => {
      const productName = order.productName
      if (!productMap[productName]) {
        productMap[productName] = {
          name: productName,
          orderCount: 0,
          totalGmv: 0,
          totalCommission: 0,
        }
      }
      productMap[productName].orderCount += 1
      productMap[productName].totalGmv += order.gmv
      productMap[productName].totalCommission += order.commission
    })

    return Object.values(productMap)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5)
  }, [coupangData])

  // 가장 높은 조회수를 가진 영상 TOP 5
  const topVideos = useMemo(() => {
    if (!youtubeVideos) return []
    
    return [...youtubeVideos]
      .filter((video) => video.views !== undefined)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
  }, [youtubeVideos])

  const isLoading = coupangLoading || youtubeLoading

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 헤더 */}
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            📦 Bookae 대시보드
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            금주의 인기 키워드와 성과를 확인하세요
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
            <span className={`ml-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              데이터를 불러오는 중...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 금주의 핫 키워드 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <CardTitle>금주의 핫 키워드</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {hotKeywords.length > 0 ? (
                  <div className="space-y-4">
                    {hotKeywords.map((keyword, index) => (
                      <motion.div
                        key={keyword.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : index === 1
                              ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              : index === 2
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          }`}>
                            {index + 1}
                          </div>
                          <span className={`font-medium ${
                            theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {keyword.name}
                          </span>
                        </div>
                        <span className={`text-sm font-semibold ${
                          theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        }`}>
                          {keyword.count}건
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    데이터가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 가장 많이 팔린 상품 TOP 5 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShoppingCart className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <CardTitle>가장 많이 팔린 상품</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <motion.div
                        key={product.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                              index === 0
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : index === 1
                                ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                : index === 2
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate ${
                                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                              }`}>
                                {product.name}
                              </p>
                              <p className={`text-xs mt-1 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                주문 {product.orderCount}건
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <p className={`text-xs ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              총 판매액
                            </p>
                            <p className={`text-sm font-semibold ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {formatCurrency(product.totalGmv)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              수익
                            </p>
                            <p className={`text-sm font-semibold ${
                              theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                            }`}>
                              {formatCurrency(product.totalCommission)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    데이터가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 가장 높은 조회수를 가진 영상 TOP 5 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Youtube className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <CardTitle>가장 높은 조회수를 가진 영상</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {topVideos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {topVideos.map((video, index) => (
                      <motion.div
                        key={video.videoId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="group cursor-pointer"
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Youtube className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              index === 0
                                ? 'bg-yellow-400 text-yellow-900'
                                : index === 1
                                ? 'bg-gray-300 text-gray-900'
                                : index === 2
                                ? 'bg-orange-400 text-orange-900'
                                : 'bg-purple-400 text-purple-900'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Eye className={`w-4 h-4 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className={`text-sm font-semibold ${
                            theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                          }`}>
                            {formatNumber(video.views || 0)}
                          </span>
                        </div>
                        <p className={`text-sm font-medium line-clamp-2 ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {video.title}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    데이터가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </motion.div>
  )
}
