import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Timeline from '../components/Timeline.vue'
import Gallery from '../components/Gallery.vue'
import MessageBoard from '../components/MessageBoard.vue'
import LoveList from '../components/LoveList.vue'
import Moments from '../components/Moments.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/timeline',
    name: 'Timeline',
    component: Timeline
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: Gallery
  },
  {
    path: '/message',
    name: 'MessageBoard',
    component: MessageBoard
  },
  {
    path: '/love-list',
    name: 'LoveList',
    component: LoveList
  },
  {
    path: '/moments',
    name: 'Moments',
    component: Moments
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../components/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router