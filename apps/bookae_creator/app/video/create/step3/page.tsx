'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Image, Mic, Type, Music, Shuffle, Play, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StepIndicator from '@/components/StepIndicator'
import { useVideoCreateStore } from '@/store/useVideoCreateStore'
import { useThemeStore } from '@/store/useThemeStore'
import VideoTitleInput from '@/components/VideoTitleInput'
import ThumbnailDesignDialog from '@/components/ThumbnailDesignDialog'
import VoiceSelectionDialog from '@/components/VoiceSelectionDialog'
import SubtitleSelectionDialog from '@/components/SubtitleSelectionDialog'
import BgmSelectionDialog from '@/components/BgmSelectionDialog'
import TransitionEffectDialog from '@/components/TransitionEffectDialog'
import PriceInfoToggle from '@/components/PriceInfoToggle'
import IntroSelectionDialog from '@/components/IntroSelectionDialog'
import { useCreateStudioJob, useStudioJob } from '@/lib/hooks/useStudio'
import type { StudioJobStatus } from '@/lib/types/api/video'

export default function Step3Page() {
  const router = useRouter()
  const { step2Result, selectedProducts, thumbnailTitle } = useVideoCreateStore()
  const theme = useThemeStore((state) => state.theme)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const effectsSectionRef = useRef<HTMLDivElement>(null)
  const videoGeneratingRef = useRef<HTMLDivElement>(null)
  const finalVideoRef = useRef<HTMLDivElement>(null)

  const createStudioJobMutation = useCreateStudioJob()
  const { data: studioJob, isLoading: isLoadingJobStatus } = useStudioJob(
    jobId,
    {
      enabled: !!jobId && isGeneratingVideo,
      refetchInterval: (data) => {
        // 작업이 완료되거나 실패하면 폴링 중지
        if (data?.status === 'COMPLETED' || data?.status === 'FAILED') {
          return false
        }
        // 진행 중이면 2초마다 폴링
        return 2000
      },
    }
  )

  // 효과 선택 완료 여부 체크
  const checkEffectsComplete = () => {
    // 모든 효과가 선택되었는지 확인 (더미로 항상 true 반환)
    return true
  }

  // 최종 영상 생성
  const handleGenerateFinalVideo = async () => {
    if (!checkEffectsComplete()) return
    if (!step2Result || !selectedProducts[0]) {
      alert('상품과 스크립트 정보가 필요합니다.')
      return
    }

    setIsGeneratingVideo(true)
    setGenerationProgress(0)
    setFinalVideoUrl(null)
    setJobId(null)

    // 스크롤
    setTimeout(() => {
      videoGeneratingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)

    try {
      // step2Result에서 imageScriptPairs 생성
      const imageScriptPairs = step2Result.scenes?.map((scene) => ({
        imageUrl: scene.imageUrl,
        script: scene.editedScript || scene.recommendedScript,
      })) || []

      if (imageScriptPairs.length === 0) {
        throw new Error('이미지와 스크립트 정보가 없습니다.')
      }

      // API 호출
      const job = await createStudioJobMutation.mutateAsync({
        productId: selectedProducts[0].id,
        jobType: 'AUTO_CREATE_VIDEO_FROM_DATA',
        imageScriptPairs,
      })

      setJobId(job.id)
    } catch (error) {
      console.error('영상 생성 요청 실패:', error)
      alert('영상 생성 요청에 실패했습니다. 서버가 실행 중인지 확인해주세요.')
      setIsGeneratingVideo(false)
      setGenerationProgress(0)
    }
  }

  // 작업 상태에 따른 진행률 및 비디오 URL 업데이트
  useEffect(() => {
    if (!studioJob) return

    const statusToProgress: Record<StudioJobStatus, number> = {
      PENDING: 10,
      PROCESSING: 50,
      COMPLETED: 100,
      FAILED: 0,
    }

    setGenerationProgress(statusToProgress[studioJob.status] || 0)

    if (studioJob.status === 'COMPLETED') {
      // 작업 완료 시 비디오 URL 설정 (실제로는 Video API에서 가져와야 함)
      // 임시로 progressDetail이나 다른 필드에서 URL을 가져올 수 있다면 사용
      setIsGeneratingVideo(false)
      // 최종 영상 섹션으로 스크롤
      setTimeout(() => {
        finalVideoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else if (studioJob.status === 'FAILED') {
      setIsGeneratingVideo(false)
      alert(`영상 생성 실패: ${studioJob.errorMessage || '알 수 없는 오류'}`)
    }
  }, [studioJob])

  // 효과 수정하기 (효과 섹션으로 즉시 스크롤)
  const handleEditEffects = () => {
    setFinalVideoUrl(null)
    setIsGeneratingVideo(false)
    setGenerationProgress(0)
    // 즉시 스크롤 (smooth 없이)
    effectsSectionRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-screen justify-center"
    >
      <div className="flex w-full max-w-[1600px]">
        <StepIndicator />
        <div className="flex-1 p-4 md:p-8 overflow-y-auto min-w-0">
          <div className="max-w-5xl mx-auto space-y-8">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                영상 편집
              </h1>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                영상 제목과 효과를 설정하고 최종 영상을 생성하세요
              </p>
            </div>

            {/* 유튜브 영상제목 입력 */}
            <div className={`p-6 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                1. 유튜브 영상제목 입력
              </h2>
              <VideoTitleInput />
            </div>

            {/* 효과 선택 */}
            <div
              ref={effectsSectionRef}
              className={`space-y-4 p-6 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <h2 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                2. 효과 선택
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 썸네일 디자인 */}
                <ThumbnailDesignDialog>
                  <Card className={`cursor-pointer hover:border-purple-500 transition-colors ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        <Image className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        }`} />
                        썸네일 디자인
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        썸네일 템플릿과 텍스트를 설정하세요
                      </p>
                    </CardContent>
                  </Card>
                </ThumbnailDesignDialog>

                {/* 목소리 선택 */}
                <VoiceSelectionDialog>
                  <Card className={`cursor-pointer hover:border-purple-500 transition-colors ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        <Mic className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        }`} />
                        목소리 선택
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        TTS/STT를 활용한 목소리 템플릿을 선택하세요
                      </p>
                    </CardContent>
                  </Card>
                </VoiceSelectionDialog>

                {/* 자막 선택 */}
                <SubtitleSelectionDialog>
                  <Card className={`cursor-pointer hover:border-purple-500 transition-colors ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        <Type className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        }`} />
                        자막 선택
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        자막의 위치, 폰트, 색상을 선택하세요
                      </p>
                    </CardContent>
                  </Card>
                </SubtitleSelectionDialog>

                {/* 배경음악 선택 */}
                <BgmSelectionDialog>
                  <Card className={`cursor-pointer hover:border-purple-500 transition-colors ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        <Music className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        }`} />
                        배경음악 선택
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        배경음악 템플릿을 선택하세요
                      </p>
                    </CardContent>
                  </Card>
                </BgmSelectionDialog>

                {/* 화면 전환효과 */}
                <TransitionEffectDialog>
                  <Card className={`cursor-pointer hover:border-purple-500 transition-colors ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        <Shuffle className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        }`} />
                        화면 전환효과
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        화면 전환효과 템플릿을 선택하세요
                      </p>
                    </CardContent>
                  </Card>
                </TransitionEffectDialog>

                {/* 인트로 선택 */}
                <IntroSelectionDialog>
                  <Card className={`cursor-pointer hover:border-purple-500 transition-colors ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        <Play className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        }`} />
                        인트로 선택
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        인트로 템플릿을 선택하세요
                      </p>
                    </CardContent>
                  </Card>
                </IntroSelectionDialog>
              </div>

              {/* 상품 가격 정보 표시 */}
              <div className={`pt-4 mt-4 border-t ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <PriceInfoToggle />
              </div>
            </div>

            {/* 최종 영상 생성 버튼 */}
            {!isGeneratingVideo && !finalVideoUrl && (
              <div className="flex justify-end">
                <Button
                  onClick={handleGenerateFinalVideo}
                  size="lg"
                  className="gap-2"
                >
                  최종 영상 생성하기
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            )}

            {/* 영상 생성 중 */}
            {isGeneratingVideo && (
              <motion.div
                ref={videoGeneratingRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-8 py-12">
                  <div className="space-y-6">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Loader2 className={`w-16 h-16 mx-auto animate-spin ${
                        theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                      }`} />
                    </motion.div>
                    <div>
                      <h2 className={`text-2xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        최종 영상을 생성하고 있어요
                      </h2>
                      <p className={`text-lg ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        잠시만 기다려주세요...
                      </p>
                    </div>

                    {/* 진행률 표시 */}
                    <div className="space-y-2 max-w-md mx-auto">
                      <div className={`w-full h-3 rounded-full overflow-hidden ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <motion.div
                          className={`h-full transition-colors ${
                            theme === 'dark' ? 'bg-purple-500' : 'bg-purple-600'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(generationProgress, 100)}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <motion.p
                        className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                        key={Math.round(generationProgress)}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                      >
                        {Math.round(generationProgress)}% 완료
                      </motion.p>
                    </div>

                    {/* 생성 중 단계 표시 */}
                    <div className={`rounded-lg p-6 max-w-md mx-auto ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                    }`}>
                      <div className="space-y-3 text-left">
                        {studioJob?.progressDetail && (
                          <div className={`text-sm mb-3 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {studioJob.progressDetail}
                          </div>
                        )}
                        <motion.div
                          className={`flex items-center gap-3 transition-all ${
                            generationProgress >= 30 ? 'opacity-100' : 'opacity-50'
                          }`}
                          animate={generationProgress >= 30 ? { x: 0 } : { x: -10 }}
                        >
                          {generationProgress >= 30 ? (
                            <CheckCircle2 className={`w-5 h-5 ${
                              theme === 'dark' ? 'text-green-400' : 'text-green-600'
                            }`} />
                          ) : (
                            <div className={`w-2 h-2 rounded-full ${
                              theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'
                            }`} />
                          )}
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            {generationProgress >= 30 ? '영상 구성 완료' : '영상 구성 중...'}
                          </span>
                        </motion.div>
                        <motion.div
                          className={`flex items-center gap-3 transition-all ${
                            generationProgress >= 60 ? 'opacity-100' : 'opacity-50'
                          }`}
                          animate={generationProgress >= 60 ? { x: 0 } : { x: -10 }}
                        >
                          {generationProgress >= 60 ? (
                            <CheckCircle2 className={`w-5 h-5 ${
                              theme === 'dark' ? 'text-green-400' : 'text-green-600'
                            }`} />
                          ) : (
                            <div className={`w-2 h-2 rounded-full ${
                              theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'
                            }`} />
                          )}
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            {generationProgress >= 60 ? '효과 적용 완료' : '효과 적용 중...'}
                          </span>
                        </motion.div>
                        <motion.div
                          className={`flex items-center gap-3 transition-all ${
                            generationProgress >= 90 ? 'opacity-100' : 'opacity-50'
                          }`}
                          animate={generationProgress >= 90 ? { x: 0 } : { x: -10 }}
                        >
                          {generationProgress >= 90 ? (
                            <CheckCircle2 className={`w-5 h-5 ${
                              theme === 'dark' ? 'text-green-400' : 'text-green-600'
                            }`} />
                          ) : (
                            <div className={`w-2 h-2 rounded-full ${
                              theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'
                            }`} />
                          )}
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            {generationProgress >= 90 ? '최종 렌더링 완료' : '최종 렌더링 중...'}
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 최종 영상 완료 */}
            {finalVideoUrl && (
              <motion.div
                ref={finalVideoRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className={`text-2xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    최종 영상 생성 완료
                  </h2>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    생성된 최종 영상을 확인하고 필요시 효과를 수정할 수 있습니다
                  </p>
                </div>

                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                  <CardHeader>
                    <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      최종 영상
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="w-full">
                      <video
                        src={finalVideoUrl}
                        controls
                        className="w-full rounded-lg"
                        style={{ maxHeight: '600px' }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleEditEffects}
                    size="lg"
                  >
                    수정하기
                  </Button>
                  <Button
                    onClick={() => router.push('/video/create/step4')}
                    size="lg"
                    className="gap-2"
                  >
                    다음 단계
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
