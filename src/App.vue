<template>
  <div id="app">
    <div style="">
      <el-container style="overflow-x: hidden;">
        <el-container style="max-height: 100vh; overflow-x: hidden;">
          <el-aside class="aside-container" style="overflow-x: hidden;">
            <el-menu default-active="1" class="app-aside-menu" router>
              <div style="display: flex; justify-content: center; padding: 20px 0 10px 0;">
                <img src="./assets/expclip-logo.png" style="width: 80%; " />
              </div>
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
          <el-main style="--el-main-padding: 0;">
            <div class="mobile-nav">
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 5px 10px ;">
                <img src="./assets/expclip-logo.png" style="height: 50px; margin-left: 20px;" />
                <div id="nav-icon4" :class="{ 'open': isOpen }" @click="toggleNav">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
            <div style="border-bottom: 1px solid var(--el-color-primary-light-9);" :style="{ display: isMobile && !isCollapse ? 'block' : 'none' }">
              <div style="width: 100%;">
                <el-menu style="width: 100%;" default-active="1" router>
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
              </div>
            </div>

            <div class="page-container">
              <!-- <el-scrollbar> -->
                <router-view />
              <!-- </el-scrollbar> -->
            </div>
          </el-main>
        </el-container>
      </el-container>
    </div>

  </div>
</template>

<script>
import { ElMenu, ElMenuItem, ElMenuItemGroup, ElSubMenu, ElContainer, ElAside, ElMain, ElHeader, ElScrollbar, ElButton } from 'element-plus';
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
    ElScrollbar,
    ElButton
  },
  data() {
    return {
      bookshelf_svg_path: mdiBookshelf,
      quote_svg_path: mdiCommentQuoteOutline,
      home_svg_path: mdiHomeAnalytics,
      export_svg_path: mdiExportVariant,
      isCollapse: true,
      isMobile: false,
      isOpen: false
    }
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile);
  },
  methods: {
    checkMobile() {
      if (window.innerWidth < 900) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    },
    toggleNav() {
      this.isOpen = !this.isOpen;
      this.isCollapse = !this.isCollapse;
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Playfair&display=swap');

@import "assets/css/color.css";
@import "assets/css/modified-el-component.css";
@import "assets/css/btn-animation.css";


body {
  font-family: Poppins, Playfair, Switzer, Inter, DM Sans, Mona Sans, Arial, sans-serif;
  font-size: 22px;
  margin: 0px;
  overflow: hidden;
}

.aside-container {
  width: 15vw;
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

.page-container {
  overflow-x: hidden;
  /* height: 100vh; */
}

/* Responsive */
/* Small devices */
@media screen and (max-width: 900px) {
  .aside-container {
    display: none;
  }

  .mobile-nav {
    display: flex;
    align-items: center;
    flex-direction: column;
    /* padding: 10px; */
    /* background-color: #f5f5f5; */
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
  }
}

/* Medium devices */
@media screen and (min-width: 900px) {
  .aside-container {
    width: 20vw;
  }

  .mobile-nav {
    display: none;
  }
}
</style>