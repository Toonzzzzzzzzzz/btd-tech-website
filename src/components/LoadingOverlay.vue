<template>
    <v-overlay
      :model-value="true"
      class="d-flex flex-column justify-center align-center"
      opacity="0.8"
      persistent
    >
      <div class="text-center">
        <v-progress-circular
          indeterminate
          size="90"
          width="8"
          color="primary"
        />
        <p class="mt-6 text-white text-xl font-bold">Loading...</p>
      </div>
    </v-overlay>
  </template>
  
  <script>
  export default {
    name: "LoadingOverlay",
  }
  </script>
  
  <style scoped>
  .text-xl {
    font-size: 1.25rem;
  }
  </style>
  