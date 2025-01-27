<template>
    <div class="popup" :class="{'popup--show': show}">
        <div class="popup-wrapper">
            <div class="popup-close" @click="closePopup">
                <CloseIcon />
            </div>
            <div class="popup__content">
                <slot/>
            </div>
        </div>
    </div>
</template>
<script setup>
import CloseIcon from "@/img/svg/close.svg?component";
import {watch} from "vue";
const show = defineModel()
function closePopup() {
    show.value = false;
}
watch(show, (newShow) => {
    console.log(document.body)
    newShow ? document.body.style.overflow = 'hidden' : document.body.style.overflow = 'unset';
})
</script>
<style lang="scss">
.popup {
    position: fixed;
    overflow-y: scroll;
    height: 100%;
    width: 100%;
    background-color: rgba(103, 103, 103, 0.45);
    top: 0;
    left: 0;
    transform: translate(0, 100%);
    z-index: 4;
    box-shadow: 0px 0px 12px 0px rgba(0,0,0,0.35);
    transition: transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1.0);
    &--show {
        transform: translate(0, 0);
    }
    .popup-close {
        position: absolute;
        cursor: pointer;
        justify-content: right;
        right: -26px;
        padding: 11px;
        background-color: #fff;
        top: -15px;
        border-radius: 10px;
        svg {
            height: 25px;
            width: 25px;
        }
    }
    .popup-wrapper {
        padding: 20px 20px 20px 20px;
        position: fixed;
        top: 100px;
        background-color: #fff;
        border-radius: 20px;
        box-shadow: 0px 0px 12px 0px rgba(0,0,0,0.35);
        left: 50%;
        transform: translate(-50%, 0);
        width: 70%;
        height: fit-content;
        min-height: 100%;
    }
    &__content {
        background-color: #fff;
    }
}
</style>
