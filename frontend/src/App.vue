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
    --input: #334155;
    --input-focus: #475569;
    --divider: #94a3b8;
    --error: #f87171;
    --sucess: #4ade80;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
  font-family: 'Roboto', sans-serif;
}

#app {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 600px) {
  #app{
    padding: 2vw;
  }
}


</style>