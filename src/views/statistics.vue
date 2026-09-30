<template>
  <div>
    <div class="page-heading"><div><span class="section-kicker">A PORTRAIT OF YOUR READING</span><h1>Reading insights</h1><p>Small signals from the ideas, authors, and books you return to most.</p></div><select v-model="period" aria-label="Insights period"><option>All time</option><option value="This year">This year · {{ insights.currentYear }}</option></select></div>
    <section class="metric-grid">
      <article class="metric panel"><span>{{ period === 'This year' ? 'BOOKS HIGHLIGHTED' : 'BOOKS COLLECTED' }}</span><strong>{{ bookCount }}</strong><small>Across {{ authorCount }} authors</small></article>
      <article class="metric panel"><span>HIGHLIGHTS SAVED</span><strong>{{ quoteCount }}</strong><small>{{ favoriteCount }} marked as favorites</small></article>
      <article class="metric panel"><span>AVERAGE PER BOOK</span><strong>{{ average }}</strong><small>Highlights per title</small></article>
      <article class="metric panel"><span>READING THEMES</span><strong>{{ tagCount }}</strong><small>{{ period === 'This year' ? 'Tags across these books' : 'Tags across your library' }}</small></article>
    </section>
    <section v-if="period === 'This year'" class="panel heatmap-panel">
      <div class="heatmap-heading"><div><span class="section-kicker">READING RHYTHM</span><h2>Your highlight activity</h2><p>{{ activeDays }} active days · {{ yearlyTotal }} highlights in {{ insights.currentYear }}</p></div><div class="heatmap-legend"><span>Less</span><i v-for="level in 5" :key="level" :class="`level-${level-1}`"></i><span>More</span></div></div>
      <div class="heatmap-scroll" :style="{'--heatmap-columns':heatmapColumns}">
        <div class="month-labels"><span v-for="month in heatmapMonths" :key="month.key" :style="{gridColumn:month.column+' / span 3'}">{{month.label}}</span></div>
        <div class="heatmap-body">
          <div class="weekday-labels"><span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span></div>
          <div class="heatmap-grid"><i v-for="day in heatmapDays" :key="day.key" :class="[ `level-${day.level}`, {'outside-period':day.outside, 'future-day':day.future} ]" :title="day.future ? `${day.label} — upcoming` : `${day.count} highlight${day.count===1?'':'s'} on ${day.label}`"></i></div>
        </div>
      </div>
    </section>
    <section class="insight-grid">
      <article class="panel chart-panel">
        <div class="panel-title"><div><span class="section-kicker">YOUR ACTIVITY</span><h2>{{ period === 'This year' ? `Highlights by month · ${insights.currentYear}` : 'Highlights by year' }}</h2></div></div>
        <div v-if="activity.length" class="chart-scroll"><div class="bars"><div v-for="item in activity" :key="item.key" class="bar-item" :class="{'future-month':item.future}"><span class="bar-value">{{ item.future ? '—' : item.count }}</span><div class="bar-track"><i :style="{height:item.height+'%'}"></i></div><small>{{ item.label }}</small></div></div></div>
        <div v-else class="mini-empty">Your highlight activity will appear here.</div>
      </article>
      <article class="panel top-books">
        <span class="section-kicker">MOST MARKED</span><h2>Books that stayed with you</h2>
        <router-link v-for="(book,index) in topBooks" :key="book.id" :to="`/books/${book.id}`"><span class="rank">0{{ index+1 }}</span><span class="book-name"><strong>{{ book.title }}</strong><small>{{ book.author }}</small></span><b>{{ book.count }}</b></router-link>
        <div v-if="!topBooks.length" class="mini-empty">No highlights to rank yet.</div>
      </article>
    </section>
    <section class="panel authors-panel"><div><span class="section-kicker">AUTHORS IN YOUR MARGINS</span><h2>Your most-read voices</h2></div><div class="authors"><div v-for="author in topAuthors" :key="author.name"><span :style="{width:author.width+'%'}"></span><strong>{{ author.name }}</strong><small>{{ author.count }} highlight{{author.count===1?'':'s'}}</small></div><p v-if="!topAuthors.length">Author patterns will emerge as your library grows.</p></div></section>
  </div>
</template>
<script setup>
import { computed,ref } from 'vue'
import { readingInsights } from '@/utils/readingInsights'
import { useBooksStore,useQuotesStore } from '@/stores'
const booksStore=useBooksStore(),quotesStore=useQuotesStore(),period=ref('All time')
const insights=computed(()=>readingInsights(booksStore.books,quotesStore.quotes,period.value))
const activity=computed(()=>period.value==='This year'?insights.value.monthly:insights.value.yearly)
const {bookCount,quoteCount,favoriteCount,authorCount,tagCount,average,topBooks,topAuthors,monthly,heatmapDays,heatmapMonths,heatmapColumns,activeDays,yearlyTotal}=Object.fromEntries(
  ['bookCount','quoteCount','favoriteCount','authorCount','tagCount','average','topBooks','topAuthors','monthly','heatmapDays','heatmapMonths','heatmapColumns','activeDays','yearlyTotal'].map(key=>[key,computed(()=>insights.value[key])])
)
</script>
<style scoped>
.month-labels span{white-space:nowrap;grid-row:1}.heatmap-grid i.future-day{opacity:.35}.future-month{opacity:.45}
.chart-panel{min-width:0}.chart-scroll{overflow-x:auto;padding-bottom:28px}.chart-scroll .bar-item{min-width:48px}.chart-scroll .bars{min-width:100%;width:max-content}.chart-scroll .bar-item small{white-space:nowrap}
.heatmap-grid i.outside-period{visibility:hidden}
.page-heading select{padding:9px 13px;border:1px solid var(--line);border-radius:7px;background:var(--paper);color:var(--muted);font-size:13px}.metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:13px}.metric{padding:23px}.metric>span{color:#747068;font-size:11px;font-weight:800;letter-spacing:.1em}.metric strong{display:block;margin:13px 0 8px;font:500 35px Georgia,serif}.metric small{color:#68655e;font-size:13px;line-height:1.4}.heatmap-panel{margin-top:18px;padding:27px}.heatmap-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.heatmap-heading h2{margin:0;font:500 22px Georgia,serif}.heatmap-heading p{margin:6px 0 0;color:var(--muted);font-size:13px}.heatmap-legend{display:flex;align-items:center;gap:5px;color:#77736b;font-size:11px}.heatmap-legend i,.heatmap-grid i{width:12px;height:12px;display:block;border-radius:2px;background:#ebe6dc}.level-1{background:#cbd9c8!important}.level-2{background:#93ad8f!important}.level-3{background:#5e7f61!important}.level-4{background:#31543f!important}.heatmap-scroll{margin-top:25px;padding-bottom:5px;overflow-x:auto}.month-labels{min-width:800px;margin-left:35px;margin-bottom:7px;display:grid;grid-template-columns:repeat(var(--heatmap-columns),12px);gap:3px;color:#747169;font-size:10px}.heatmap-body{min-width:835px;display:flex;gap:8px}.weekday-labels{width:27px;display:grid;grid-template-rows:repeat(7,12px);gap:3px;color:#77736b;font-size:9px}.weekday-labels span{display:flex;align-items:center}.heatmap-grid{display:grid;grid-auto-flow:column;grid-template-rows:repeat(7,12px);grid-template-columns:repeat(var(--heatmap-columns),12px);gap:3px}.heatmap-grid i{cursor:help;transition:transform .12s}.heatmap-grid i:hover{outline:2px solid #263a34;outline-offset:1px;transform:scale(1.12)}.insight-grid{margin-top:18px;display:grid;grid-template-columns:1.45fr 1fr;gap:18px}.chart-panel,.top-books{min-height:340px;padding:27px}.panel-title h2,.top-books h2,.authors-panel h2{margin:0;font:500 22px Georgia,serif}.bars{height:235px;margin-top:25px;padding-top:18px;border-bottom:1px solid var(--line);display:flex;align-items:flex-end;gap:12px}.bar-item{height:100%;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end}.bar-track{width:min(32px,70%);height:82%;display:flex;align-items:flex-end;border-radius:4px 4px 0 0;background:#eee9df;overflow:hidden}.bar-track i{width:100%;display:block;background:#d06a4e;border-radius:4px 4px 0 0}.bar-value{color:#706d65;font-size:11px}.bar-item small{margin:8px 0 -22px;color:#6f6b63;font-size:11px}.top-books>a{padding:16px 0;border-bottom:1px solid #ebe6dc;display:flex;align-items:center;gap:13px}.rank{color:#928e85;font:italic 14px Georgia,serif}.book-name{min-width:0;flex:1}.book-name strong,.book-name small{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.book-name strong{font:600 15px Georgia,serif}.book-name small{margin-top:5px;color:#68655e;font-size:12px}.top-books>a>b{color:var(--accent);font:500 19px Georgia,serif}.mini-empty{height:210px;display:grid;place-items:center;color:var(--muted);font-size:13px}.authors-panel{margin-top:18px;padding:27px;display:grid;grid-template-columns:250px 1fr;gap:40px}.authors>div{min-height:38px;position:relative;margin-bottom:7px;padding:0 12px;display:flex;align-items:center}.authors>div>span{position:absolute;inset:0 auto 0 0;border-radius:4px;background:#e6dfd2}.authors strong,.authors small{position:relative}.authors strong{font:600 13px Georgia,serif}.authors small{margin-left:auto;color:#5f5c55;font-size:12px}.authors p{color:var(--muted);font-size:13px}@media(max-width:900px){.metric-grid{grid-template-columns:repeat(2,1fr)}.insight-grid{grid-template-columns:1fr}.authors-panel{grid-template-columns:1fr}}@media(max-width:600px){.heatmap-heading{align-items:flex-start;flex-direction:column}.metric-grid{grid-template-columns:1fr 1fr}.metric{padding:17px}.metric strong{font-size:28px}.metric small{font-size:12px}.authors-panel{gap:20px}}
</style>
