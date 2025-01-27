<template>
    <div class="delete-modal">
        <div class="delete-modal__notify">
            Вы уверены что хотите удалить этот курс ?
        </div>
        <div class="delete-modal__buttons">
            <button @click="handleDelete">Да</button>
            <button @click="closeModal()">Нет</button>
        </div>
    </div>
</template>
<script setup>
import {closeModal, Modal} from "jenesius-vue-modal";
const emit = defineEmits(['delete']);
function handleDelete() {
    emit('delete', Math.random());
}
</script>
<style lang="scss">
.delete-modal {
    background: #fff;
    padding: 20px;
    &__buttons {
        display: flex;
        margin-top: 10px;
        button {
            margin-right: 10px;
        }
    }
}
</style>
