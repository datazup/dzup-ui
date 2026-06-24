<script setup lang="ts">
import Hero from '../components/Hero.vue'
import ShowcaseDashboard from '../components/ShowcaseDashboard.vue'
import FeatureGrid from '../components/FeatureGrid.vue'
import ThemingDemo from '../components/ThemingDemo.vue'
import ComponentGallery from '../components/ComponentGallery.vue'
import EcosystemGrid from '../components/EcosystemGrid.vue'
import SocialProof from '../components/SocialProof.vue'
import FreeVsPro from '../components/FreeVsPro.vue'
import CommunityCTA from '../components/CommunityCTA.vue'
import { vReveal } from '../composables/useScrollReveal.ts'
</script>

<template>
  <Hero />
  <div v-reveal><ShowcaseDashboard /></div>
  <div v-reveal><FeatureGrid /></div>
  <div v-reveal><ThemingDemo /></div>
  <div v-reveal><ComponentGallery /></div>
  <div id="ecosystem" v-reveal><EcosystemGrid /></div>
  <div v-reveal><SocialProof /></div>
  <div v-reveal><FreeVsPro /></div>
  <div v-reveal><CommunityCTA /></div>
</template>
