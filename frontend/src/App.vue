<script setup>
</script>

<template>
  <div>
    <router-view />
  </div>
</template>

<style>
:root {
    --bg: #0f172a;
    --card: #1e293b;
    --sec:  #0b72a1;
    --accent: #38bdf8;
    --text: #f1f5f9;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
  color: #f1f5f9;
  font-family: 'Roboto', sans-serif;
}

#app {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>