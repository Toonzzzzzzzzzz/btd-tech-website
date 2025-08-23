<template>
    <div style="height:260px;">
      <Bar :data="dataObj" :options="options" />
    </div>
  </template>
  
  <script>
  import { Bar } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    BarElement, CategoryScale, LinearScale,
    Tooltip, Legend, Title
  } from 'chart.js'
  
  ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title)
  
  export default {
    name: 'BarSimple',
    components: { Bar },
    props: {
      labels: { type: Array, required: true },     // ['จันทร์','อังคาร',...]
      values: { type: Array, required: true }      // [12, 9, 15, ...]
    },
    computed: {
      dataObj() {
        return {
          labels: this.labels,
          datasets: [{
            label: 'จำนวน',
            data: this.values,
            backgroundColor: '#42A5F5'   // สีเดียว เรียบง่าย
          }]
        }
      },
      options() {
        return {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true } },
          scales: {
            y: { beginAtZero: true }
          }
        }
      }
    }
  }
  </script>
  