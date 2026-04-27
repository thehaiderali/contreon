import { api } from '@/lib/api';

class ExploreService {
  async getCategories() {
    const response = await api.get('/explore/categories');
    return response.data;
  }

  async getRecentlyVisited() {
    const response = await api.get('/explore/recently-visited');
    return response.data;
  }

  async getCreatorsForYou() {
    const response = await api.get('/explore/creators-for-you');
    return response.data;
  }

  async getPopularThisWeek() {
    const response = await api.get('/explore/popular-this-week');
    return response.data;
  }

  async getTopics() {
    const response = await api.get('/explore/topics');
    return response.data;
  }

  async getTopCreatorsByCategory(category = null) {
    const params = category && category !== 'all' ? { category } : {};
    const response = await api.get('/explore/top-creators', { params });
    return response.data;
  }

  async getNewCreators() {
    const response = await api.get('/explore/new');
    return response.data;
  }

  async searchCreatorsOrTopics(query) {
    const response = await api.get('/explore/search', { params: { q: query } });
    return response.data;
  }
}

export default new ExploreService();