import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MessageCircle, Users, TrendingUp, FileText, BarChart3 } from 'lucide-react'
import { api } from '@/lib/api'

const Insights = () => {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await api.get('/insights')
        if (response.data.success) {
          setInsights(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching insights:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInsights()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Insights</h1>
        <p>No data available</p>
      </div>
    )
  }

  const stats = [
    { label: 'Total Posts', value: insights.totalPosts, icon: FileText, color: 'bg-blue-500' },
    { label: 'Total Views', value: insights.totalViews, icon: Eye, color: 'bg-green-500' },
    { label: 'Total Comments', value: insights.totalComments, icon: MessageCircle, color: 'bg-purple-500' },
    { label: 'Subscribers', value: insights.totalSubscribers, icon: Users, color: 'bg-orange-500' },
  ]

  const recentStats = [
    { label: 'Views (7 days)', value: insights.recentViews, icon: TrendingUp },
    { label: 'Comments (7 days)', value: insights.recentComments, icon: MessageCircle },
  ]

  const getBarWidth = (value, max) => {
    if (!max) return '0%'
    const width = (value / max) * 100
    return `${Math.min(width, 100)}%`
  }

  const maxViews = Math.max(...(insights.topPostsByViews?.map(p => p.views) || [0]))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value || 0}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        {recentStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value || 0}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Posts by Views */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Top Posts by Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.topPostsByViews?.length > 0 ? (
            <div className="space-y-3">
              {insights.topPostsByViews.slice(0, 5).map((post, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">{index + 1}</span>
                      <span className="font-medium truncate max-w-[200px]">{post.title}</span>
                      <span className="text-xs text-muted-foreground capitalize">({post.type})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      <span>{post.views}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden ml-9">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: getBarWidth(post.views, maxViews) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No views yet</p>
          )}
        </CardContent>
      </Card>

      {/* Top Posts by Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Top Posts by Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.topPostsByComments?.length > 0 ? (
            <div className="space-y-3">
              {insights.topPostsByComments.slice(0, 5).map((post, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>
                    <div>
                      <p className="font-medium">{post.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{post.type} post</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No comments yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Insights