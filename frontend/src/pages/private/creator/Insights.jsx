import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MessageCircle, Users, FileText, ThumbsUp, ThumbsDown } from 'lucide-react'
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
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Insights</h1>
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  const stats = [
    { label: 'Posts', value: insights.totalPosts, icon: FileText },
    { label: 'Views', value: insights.totalViews, icon: Eye },
    { label: 'Comments', value: insights.totalComments, icon: MessageCircle },
    { label: 'Subscribers', value: insights.totalSubscribers, icon: Users },
    { label: 'Likes', value: insights.totalLikes, icon: ThumbsUp },
    { label: 'Dislikes', value: insights.totalDislikes, icon: ThumbsDown },
  ]

  const maxViews = Math.max(...(insights.topPostsByViews?.map(p => p.views) || [1]))

  const getBarWidth = (value) => {
    if (!maxViews) return '0%'
    return `${Math.min((value / maxViews) * 100, 100)}%`
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Insights</h1>
        <span className="text-sm text-muted-foreground">Last 30 days</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xl font-semibold">{stat.value || 0}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Views (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{insights.recentViews || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Comments (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{insights.recentComments || 0}</p>
          </CardContent>
        </Card>
      </div>

      {insights.topPostsByViews?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Posts by Views</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.topPostsByViews.slice(0, 5).map((post, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-4">{index + 1}</span>
                    <span className="truncate max-w-[180px]">{post.title}</span>
                  </div>
                  <span className="text-muted-foreground">{post.views}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: getBarWidth(post.views) }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {insights.topPostsByComments?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Posts by Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.topPostsByComments.slice(0, 5).map((post, index) => (
              <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{index + 1}</span>
                  <span className="truncate max-w-[180px]">{post.title}</span>
                </div>
                <span className="text-muted-foreground">{post.comments}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Insights