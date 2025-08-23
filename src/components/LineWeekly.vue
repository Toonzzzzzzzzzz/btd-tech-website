<template>
    <div style="height:300px;">
      <Line :data="dataObj" :options="options" />
    </div>
  </template>
  
  <script>
  import { Line } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    LineElement, PointElement, CategoryScale, LinearScale,
    Tooltip, Legend, Title
  } from 'chart.js'
  
  ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Title)
  
  export default {
    name: 'LineWeekly',
    components: { Line },
    props: {
      labels: { type: Array, required: true },   // ตัวอย่าง: ['จ','อ','พ','พฤ','ศ','ส','อา']
      values: { type: Array, required: true },   // ตัวอย่าง: [1.2, 0.8, 2.4, 1.1, 3.0, 0.5, 0.9]
      datasetLabel: { type: String, default: 'ชั่วโมงต่อวัน (สัปดาห์นี้)' }
    },
    computed: {
      dataObj() {
        return {
          labels: this.labels,
          datasets: [{
            label: this.datasetLabel,
            data: this.values,
            borderColor: '#FF9800',
            backgroundColor: 'rgba(255,152,0,0.2)',
            fill: true,
            tension: 0.3,
            pointRadius: 3
          }]
        }
      },
      options() {
        return {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            title: { display: true, text: 'สรุปรายสัปดาห์' }
          },
          scales: { y: { beginAtZero: true } }
        }
      }
    }
  }
  </script>
  