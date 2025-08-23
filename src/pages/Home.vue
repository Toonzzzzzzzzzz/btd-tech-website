<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col class="text-center">
        <h1>Welcome to the Home Page</h1>
        <v-btn color="primary" to="/login" class="mt-4">
          Go to Login
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'HomePage',
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
