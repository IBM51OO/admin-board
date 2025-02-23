<script setup>
import {RouterView} from 'vue-router'
import {container as WidgetContainerModal} from "jenesius-vue-modal";
import {Notifications} from "@kyvg/vue3-notification";
</script>

<template>
    <widget-container-modal/>
    <notifications />
    <RouterView/>
</template>

<style>
</style>
