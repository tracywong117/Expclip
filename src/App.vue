<template>
  <div id="app">
    <div style="">
      <el-container style="overflow: hidden;">
        <el-container style="max-height: 100vh;">
          <el-aside class="aside-container">
            <el-menu default-active="1" class="app-aside-menu" :collapse="isCollapse" @open="handleOpen"
              @close="handleClose" router>
              <img src="./assets/expclip-logo.svg" class="logo-svg" />
              <el-menu-item index="/">
                <svg-icon type="mdi" :path="home_svg_path" class="menu_logo_svg"></svg-icon>
                <template #title>Home</template>
              </el-menu-item>
              <el-sub-menu index="2">
                <template #title>
                  <svg-icon type="mdi" :path="bookshelf_svg_path" class="menu_logo_svg" route="/books"></svg-icon>
                  <span>Books</span>
                </template>
                <el-menu-item-group>
                  <template #title><span>Group One</span></template>
                  <el-menu-item index="2-1">item one</el-menu-item>
                  <el-menu-item index="2-2">item two</el-menu-item>
                </el-menu-item-group>
                <el-menu-item-group title="Group Two">
                  <el-menu-item index="2-3">item three</el-menu-item>
                </el-menu-item-group>
                <el-sub-menu index="2-4">
                  <template #title><span>item four</span></template>
                  <el-menu-item index="2-4-1">item one</el-menu-item>
                </el-sub-menu>
              </el-sub-menu>
              <el-menu-item index="/quotes">
                <svg-icon type="mdi" :path="quote_svg_path" class="menu_logo_svg"></svg-icon>
                <template #title>Quotes</template>
              </el-menu-item>
              <el-menu-item index="/books">
                <svg-icon type="mdi" :path="export_svg_path" class="menu_logo_svg"></svg-icon>
                <template #title>Export</template>
              </el-menu-item>
            </el-menu>
          </el-aside>
          <el-main>
            <div class="page-container">
              <el-scrollbar>
                <router-view />
              </el-scrollbar>
            </div>
          </el-main>
        </el-container>
      </el-container>
    </div>

  </div>
</template>

<script>
import { ElMenu, ElMenuItem, ElMenuItemGroup, ElSubMenu, ElContainer, ElAside, ElMain, ElHeader,ElScrollbar } from 'element-plus';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiBookshelf, mdiCommentQuoteOutline, mdiHomeAnalytics, mdiExportVariant } from '@mdi/js';

export default {
  components: {
    ElMenu,
    ElMenuItem,
    ElMenuItemGroup,
    ElSubMenu,
    ElContainer,
    ElAside,
    ElMain,
    ElHeader,
    SvgIcon,
    ElScrollbar
  },
  data() {
    return {
      bookshelf_svg_path: mdiBookshelf,
      quote_svg_path: mdiCommentQuoteOutline,
      home_svg_path: mdiHomeAnalytics,
      export_svg_path: mdiExportVariant,
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Playfair&display=swap');

:root {
  /* --el-color-primary: #134563; */
  --el-color-primary: rgb(102, 193, 179);
  /* menu active */
  --el-color-primary-light-3: #29abb4;
  --el-color-primary-light-5: #8decec;
  --el-color-primary-light-7: #aceaf0;
  --el-color-primary-light-8: #c3e2f4;
  --el-color-primary-light-9: #e0f8ee;
  /* menu hover */
  --el-color-primary-light-9: rgba(158, 205, 153, 0.2);
  --el-color-primary-dark-2: #2d7ed0;
}

body {
  font-family: Poppins, Playfair, Switzer, Inter, DM Sans, Mona Sans, Arial, sans-serif;
  font-size: 22px;
  margin: 0px;
  overflow: hidden;
}

.aside-container {
  width: 15vw;
}

@media screen and (min-width: 768px) {
  .aside-container {
    width: 20vw;
  }
}

.app-aside-menu {
  min-height: 100vh;
  /* background-color: #BDC5E41C; */
}

.logo-svg {
  padding: 1rem 2.5rem 0rem 2.5rem;
}

.menu_logo_svg {
  padding-right: 1rem;
}


.el-menu-item.is-active {
  background-color: rgba(158, 205, 153, 0.2);
}

.el-menu-item {
  border-radius: 45px;
  margin: 0.5rem 1rem;
}

.el-sub-menu__title {
  border-radius: 45px;
  margin: 0.5rem 1rem;
}
</style>