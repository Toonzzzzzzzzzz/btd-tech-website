<template>
    <div style="height:300px;">
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
    name: 'BarDaily',
    components: { Bar },
    props: {
      labels: { type: Array, required: true },  // ตัวอย่าง: ['16/08','17/08','18/08']
      values: { type: Array, required: true },  // ตัวอย่าง: [2.5, 1.2, 3.1]
      datasetLabel: { type: String, default: 'ชั่วโมงต่อวัน' }
    },
    computed: {
      dataObj() {
        return {
          labels: this.labels,
          datasets: [{
            label: this.datasetLabel,
            data: this.values,
            backgroundColor: '#42A5F5'
          }]
        }
      },
      options() {
        return {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            title: { display: true, text: 'สรุปรายวัน' }
          },
          scales: { y: { beginAtZero: true } }
        }
      }
    }
  }
  </script>
  