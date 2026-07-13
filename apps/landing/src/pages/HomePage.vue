<script setup lang="ts">
import CommunityCTA from '../components/CommunityCTA.vue'
import ComponentGallery from '../components/ComponentGallery.vue'
import EcosystemGrid from '../components/EcosystemGrid.vue'
import FeatureGrid from '../components/FeatureGrid.vue'
import FreeVsPro from '../components/FreeVsPro.vue'
import Hero from '../components/Hero.vue'
import HomeTestimonials from '../components/HomeTestimonials.vue'
import ShowcaseDashboard from '../components/ShowcaseDashboard.vue'
import SocialProof from '../components/SocialProof.vue'
import ThemingDemo from '../components/ThemingDemo.vue'
import { vReveal } from '../composables/useScrollReveal.ts'
</script>

<template>
  <Hero />
  <div v-reveal>
    <ShowcaseDashboard />
  </div>
  <div v-reveal>
    <FeatureGrid />
  </div>
  <div v-reveal>
    <ThemingDemo />
  </div>
  <div v-reveal>
    <ComponentGallery />
  </div>
  <div id="ecosystem" v-reveal>
    <EcosystemGrid />
  </div>
  <div v-reveal>
    <SocialProof />
  </div>
  <!-- Renders nothing until `TESTIMONIALS` in config.ts holds real, cleared quotes. -->
  <div v-reveal>
    <HomeTestimonials />
  </div>
  <div v-reveal>
    <FreeVsPro />
  </div>
  <div v-reveal>
    <CommunityCTA />
  </div>
</template>
