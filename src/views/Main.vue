<template>
    <el-row class="container">
        <el-col :span="24" class="header">
            <el-col :span="10" class="logo" :class="isCollapse?'logo-collapse-width':'logo-width'">
                {{isCollapse? minSysName:sysName}}
            </el-col>
            <el-col :span="10">
                <div class="tools" @click.prevent="menuCollapse">
                    <i class="fa fa-align-justify tools-i" :class="isCollapse? 'tools-i-collapse':''"></i>
                </div>
            </el-col>
            <el-col :span="4" class="userinfo">
                <el-dropdown trigger="hover">
                    <span class="el-dropdown-link userinfo-inner">
                        <img :src="userAvatar"/>
                        Tony
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item>修改密码</el-dropdown-item>
                        <el-dropdown-item>刷新权限</el-dropdown-item>
                        <el-dropdown-item divided>退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-col>
        </el-col>
        <el-col :span="24" class="main">
            <el-menu class="el-menu-vertical-demo" :default-active="$route.path" :collapse="isCollapse"
                     unique-opened router background-color="#324157" text-color="#BFCBD9">
                <template v-for="(item,index) in $router.options.routes" v-if="!item.hidden">
                    <el-submenu :index="'1-'+index" v-if="item.children">
                        <template slot="title">
                            <i :class="item.meta.icon" v-if="item.meta.icon"></i>
                            <span slot="title">{{item.meta.title}}</span>
                        </template>

                        <template v-for="(item2,index2) in item.children" v-if="!item2.hidden">
                            <el-submenu :index="'2-'+index2" v-if="item2.children">
                                <template slot="title">
                                    <i :class="item2.meta.icon" v-if="item2.meta.icon"></i>
                                    <span slot="title">{{item2.meta.title}}</span>
                                </template>
                                <el-menu-item v-for="child in item2.children"
                                              :index="item.path+'/'+item2.path+'/'+child.path" :key="child.path"
                                              v-if="!child.hidden">{{child.meta.title}}
                                </el-menu-item>
                            </el-submenu>
                            <el-menu-item :index="item.path+'/'+item2.path" v-if="!item2.children">
                                <i :class="item2.meta.icon" v-if="item2.meta.icon"></i>
                                <span slot="title">{{item2.meta.title}}</span>
                            </el-menu-item>
                        </template>

                    </el-submenu>
                    <el-menu-item :index="item.path" v-if="!item.children">
                        <i :class="item.meta.icon" v-if="item.meta.icon"></i>
                        <span slot="title">{{item.meta.title}}</span>
                    </el-menu-item>
                </template>
            </el-menu>
            <section class="content-container">
                <div class="tags-wrapper">
                    <ul>
                        <li class="tags-li"
                            v-for="tag in visitedViews"
                            :class="isActive(tag)?'active':''">
                            <router-link ref="tag" :to="tag.path" :key="tag.path" class="tags-li-title">
                                {{tag.meta.title}}
                            </router-link>
                            <span class="tags-li-icon" @click.prevent.stop="closeSelectedTag(tag)">
                                <i class="el-icon-close"></i>
                            </span>
                        </li>
                    </ul>
                    <div class="tags-close-box">
                        <el-dropdown trigger="click">
                            <el-button size="mini" type="primary">
                                <span>标签选项<i class="el-icon-arrow-down el-icon--right"></i></span>
                            </el-button>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item @click="refreshSelectedTag(selectedTag)">刷新当页</el-dropdown-item>
                                <el-dropdown-item @click="closeOthersTags">关闭其他</el-dropdown-item>
                                <el-dropdown-item @click="closeAllTags">关闭所有</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </div>
                </div>
                <div class="content-wrapper">
                    <transition name="fade" mode="out-in">
                        <router-view></router-view>
                    </transition>
                </div>
            </section>
        </el-col>
    </el-row>
</template>

<script>
    import Avatar from '@/assets/user.png';

    export default {
        name: 'Main',
        data() {
            return {
                sysName: '控制台',
                minSysName: 'T',
                isCollapse: false,
                userAvatar: Avatar,
                visible: false,
                top: 0,
                left: 0,
                selectedTag: {}
            };
        },
        computed: {
            visitedViews() {
                return this.$store.state.tagsView.visitedViews
            }
        },
        watch: {
            $route() {
                this.addViewTags();
                this.moveToCurrentTag();
            },
            visible(value) {
                if (value) {
                    document.body.addEventListener('click', this.closeMenu);
                } else {
                    document.body.removeEventListener('click', this.closeMenu);
                }
            }
        },
        methods: {
            menuCollapse() {
                this.isCollapse = !this.isCollapse;
            },
            isActive(route) {
                return route.path === this.$route.path;
            },
            addViewTags() {
                const {name} = this.$route;
                if (name) {
                    this.$store.dispatch('addView', this.$route);
                }
                return false;
            },
            moveToCurrentTag() {
                const tags = this.$refs.tag;
                this.$nextTick(() => {
                    for (const tag of tags) {
                        if (tag.to === this.$route.path) {
                            // when query is different then update
                            if (tag.to !== this.$route.fullPath) {
                                this.$store.dispatch('updateVisitedView', this.$route);
                            }
                            break;
                        }
                    }
                });
            },
            refreshSelectedTag(view) {
                this.$store.dispatch('delCachedView', view).then(() => {
                    const {fullPath} = view;
                    this.$nextTick(() => {
                        this.$router.replace({
                            path: '/redirect' + fullPath
                        })
                    })
                })
            },
            closeSelectedTag(view) {
                this.$store.dispatch('delView', view).then(({visitedViews}) => {
                    if (this.isActive(view)) {
                        const latestView = visitedViews.slice(-1)[0];
                        if (latestView) {
                            this.$router.push(latestView);
                        } else {
                            this.$router.push('/');
                        }
                    }
                })
            },
            closeOthersTags() {
                this.$router.push(this.selectedTag);
                this.$store.dispatch('delOthersViews', this.selectedTag).then(() => {
                    this.moveToCurrentTag();
                });
            },
            closeAllTags() {
                this.$store.dispatch('delAllViews');
                this.$router.push('/');
            }
        },
        mounted() {
            this.addViewTags();
        }
    }
</script>

<style lang="scss" scoped>
    .container {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100%;
        min-width: 1070px;
        .header {
            height: 50px;
            line-height: 50px;
            background: #242f42;
            color: #fff;
            .logo {
                width: 200px;
                height: 50px;
                font-size: 22px;
                text-align: center;
                padding-left: 20px;
                padding-right: 20px;
                border-right: solid 1px rgba(255, 255, 255, .08);
            }
            .logo-width {
                width: 200px;
            }
            .logo-collapse-width {
                width: 64px
            }
            .tools {
                width: 14px;
                height: 50px;
                line-height: 50px;
                padding: 0 23px;
                cursor: pointer;
            }
            .tools-i {
                transform: rotate(0deg);
            }
            .tools-i-collapse {
                transform: rotate(90deg);
            }
            .userinfo {
                text-align: right;
                padding-right: 35px;
                float: right;
                .userinfo-inner {
                    cursor: pointer;
                    color: #fff;
                    img {
                        width: 40px;
                        height: 40px;
                        border-radius: 20px;
                        margin: 5px 0 5px 10px;
                        float: right;
                    }
                }
            }
        }
        .main {
            display: flex;
            position: absolute;
            top: 50px;
            bottom: 0;
            overflow: hidden;
            .content-container {
                flex: 1;
                background-color: #e3e3e3;
                .tags-wrapper {
                    position: relative;
                    height: 30px;
                    overflow: hidden;
                    background: #fff;
                    padding-right: 110px;
                    border-bottom: 1px solid rgba(79, 79, 80, .35);
                    box-shadow: 0 0 6px rgba(79, 79, 80, .35);
                    ul {
                        box-sizing: border-box;
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        .tags-li {
                            float: left;
                            margin: 3px 5px 2px 3px;
                            border-radius: 3px;
                            font-size: 12px;
                            font-weight: 500;
                            overflow: hidden;
                            cursor: pointer;
                            height: 23px;
                            line-height: 23px;
                            border: 1px solid #e9eaec;
                            background: #fff;
                            padding: 0 5px 0 12px;
                            vertical-align: middle;
                            color: #666;
                            transition: all .3s ease-in;
                            .tags-li-title {
                                float: left;
                                max-width: 80px;
                                overflow: hidden;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                text-decoration: none;
                                margin-right: 5px;
                                color: #666;
                            }
                        }
                        .active {
                            color: #fff;
                            border: 1px solid #409eff;
                            background-color: #409eff;
                            .tags-li-title {
                                color: #fff;
                            }
                        }
                    }
                    .tags-close-box {
                        position: absolute;
                        right: 0;
                        top: 0;
                        box-sizing: border-box;
                        padding-top: 1px;
                        text-align: center;
                        width: 110px;
                        height: 30px;
                        background: #fff;
                        box-shadow: 0 0 6px 3px rgba(0, 0, 0, .1);
                        z-index: 10;
                    }
                }
                .content-wrapper {
                    width: auto;
                    height: 100%;
                    padding: 10px;
                    overflow-y: scroll;
                    box-sizing: border-box;
                }
            }
        }
    }
</style>