import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Zap } from 'lucide-react'

type StatsTab = 'daily' | 'weekly' | 'monthly'

function StatsView() {
  const [activeTab, setActiveTab] = useState<StatsTab>('daily')

  const tabs = [
    { id: 'daily' as StatsTab, label: '일간', emoji: '📈' },
    { id: 'weekly' as StatsTab, label: '주간', emoji: '📊' },
    { id: 'monthly' as StatsTab, label: '월간', emoji: '📋' },
  ]

  const mockStats = {
    daily: {
      completionRate: 75,
      contextSwitches: 8,
      topCategory: '공부'
    },
    weekly: {
      completionRate: 68,
      contextSwitches: 42,
      topCategory: '업무'
    },
    monthly: {
      completionRate: 72,
      contextSwitches: 156,
      topCategory: '공부'
    }
  }

  const currentStats = mockStats[activeTab]

  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          📊 나의 통계
        </h2>
        <p className="text-gray-600">내 생산성을 확인해보세요</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-2xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-800 shadow-lg'
                : 'text-gray-600 hover:bg-white/30'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mr-2">{tab.emoji}</span>
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <motion.div
          className="bg-white/40 backdrop-blur-lg rounded-3xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-2xl">
              <Target className="text-green-600" size={20} />
            </div>
            <span className="text-sm text-gray-600">완수율</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {currentStats.completionRate}%
          </div>
          <div className="text-sm text-green-600 mt-1">
            ✨ 잘하고 있어요!
          </div>
        </motion.div>

        <motion.div
          className="bg-white/40 backdrop-blur-lg rounded-3xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-2xl">
              <Zap className="text-orange-600" size={20} />
            </div>
            <span className="text-sm text-gray-600">컨텍스트 스위칭</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {currentStats.contextSwitches}회
          </div>
          <div className="text-sm text-orange-600 mt-1">
            🎯 집중력 UP!
          </div>
        </motion.div>

        <motion.div
          className="bg-white/40 backdrop-blur-lg rounded-3xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-coral-100 rounded-2xl">
              <TrendingUp className="text-coral-600" size={20} />
            </div>
            <span className="text-sm text-gray-600">주요 카테고리</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {currentStats.topCategory}
          </div>
          <div className="text-sm text-coral-600 mt-1">
            📚 열심히 해요!
          </div>
        </motion.div>
      </div>

      {/* 상세 차트 영역 */}
      <motion.div
        className="bg-white/40 backdrop-blur-lg rounded-3xl p-6 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📈 상세 분석
        </h3>
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <p>차트가 여기에 표시됩니다</p>
          <p className="text-sm mt-2">데이터가 쌓이면 더 자세한 분석을 보여드릴게요!</p>
        </div>
      </motion.div>
    </div>
  )
}

export default StatsView
