<template>
    <div class="new-course">
        <Form :validation-schema="schema" @submit="onSubmit">
            <div class="new-course__header">
                <div class="new-course__controlls">
                    <div class="new-course__title">
                        название курса
                        <Field name="name" placeholder="Название" v-model="courseData.name" />
                        <ErrorMessage name="name"/>
                    </div>
                </div>
                <button class="ally-button">Опубликовать</button>
            </div>
            <div class="new-course__group-wrapper">
                <div class="new-course__groups">
                    <Field name="groups" as="select" @change="onChangeGroup" v-model="courseData.groups">
                        <option value="">Выберите группу</option>
                        <option :value="item.id" v-for="item in groups" :key="item.id">{{item.name}}</option>
                        <option value="newGroup">Создать группу</option>
                    </Field>
                    <ErrorMessage name="groups"/>
                    <Field name="groupField" v-if="courseData.groups === 'newGroup'" placeholder="Название группы" v-model="groupName" />
                    <div @click="createNewGroup"><img src="../img/check.png" alt="" v-if="groupName"></div>
                </div>
                <div class="new-course__group-image" v-if="selectGroupValue">
                    <span>Обновить фото группы</span>
                    <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" @change="uploadGroupImage"  />
                </div>
            </div>
            <div class="new-course__price">
                <label>
                    Цена курса (GBP)
                    <Field name="price" placeholder="Цена" v-model="courseData.price"/>
                    <ErrorMessage name="price"/>
                </label>
            </div>
            <div class="new-course__price-second">
                <label>
                    Цена курса (EUR)
                    <Field name="priceSecond" placeholder="Цена" v-model="courseData.priceSecond"/>
                    <ErrorMessage name="priceSecond"/>
                </label>
            </div>
            <div class="new-course__description">
                <span>Описание</span>
                <Field name="description" placeholder="Описание" v-model="courseData.description"/>
                <ErrorMessage name="description"/>
            </div>
            <div class="new-course__content-description">
                <span>Предварительный контент курса</span>
                <Field name="contentDescription" placeholder="Предварительный контент курса" v-model="courseData.contentDescription"/>
                <ErrorMessage name="contentDescription"/>
            </div>
            <div class="new-course__content" v-for="(page, index) in pages" :key="index">
                <h3 v-if="pages > 1">Страница {{index + 1}}</h3>
                <div class="new-course__content-title" v-if="coursesContent[index]?.title">
                    <span>Заголовок</span>
                    <Field :name="`title-${index}`" placeholder="Описание" v-model="coursesContent[index].title"/>
                    <ErrorMessage :name="`title-${index}`"/>
                </div>
                <div>Контент</div>
                <div v-if="coursesContent[index]?.text">
                    <QuillEditor v-model:content="coursesContent[index].text" class="quill-editor" ref="textContent"/>
                </div>
            </div>
            <div class="ally-button" v-if="pages > 1" @click="deletePage">Удалить страницу</div>
            <div class="ally-button" @click="addPage">
                добавить страницу
            </div>
        </Form>
    </div>
</template>
<script setup>
import {QuillEditor} from "@vueup/vue-quill";
import {Field, Form, ErrorMessage, useForm} from 'vee-validate';
import axios from "axios";
import {notify} from "@kyvg/vue3-notification";
import {nextTick, reactive, ref} from "vue";
import * as yup from "yup";
const base = 'http://91.227.40.254:8888';
const secondBase = 'http://91.227.40.254:8880';
const groupName = ref();
const schema =  yup.object({
    name: yup.string().required('Name is a required field'),
    contentDescription: yup.string().required('Content Description is a required field'),
    groups: yup.string().required('Required field'),
    price: yup.string().required('Price is a required field'),
    priceSecond: yup.string().required('Price is a required field'),
    description: yup.string().required('Description is a required field'),
});
const courseData = reactive({
    name: '',
    groups: '',
    contentDescription: '',
    price: '',
    priceSecond: '',
    description: '',
    images: [],
});
const groups = ref(null);
const selectGroupValue = ref('');
const coursesContent = ref([
    {
        title: ' ',
        text: ' ',
    }
]);
async function editCourse(id) {
    const {data} = await axios.get(`${base}/fitsphere/products/${id}`);
    editCourseId.value = id;
    editedCourse.value = data;
    courseData.description = data.description;
    courseData.name = data.name;
    courseData.groups = data.group;
    courseData.images = data.images;
    courseData.price = data.prices[0]?.amount;
    courseData.priceSecond = data.prices[1]?.amount;
    courseData.contentDescription = data.content;
    coursesContent.value.pop();
    editedCourse.value.pages.forEach((el, index) => {
        coursesContent.value.push({
            title: el.title,
            text: el.text
        })
        nextTick(() => {
            console.log(textContent.value[index])
            textContent.value[index].setText(el.text);
        })
    })
    pages.value = editedCourse.value.pages.length;
    createCoursePopup.value = true;
}
function addPage() {
    coursesContent.value.push({
        text: ' ',
        title: ' ',
    });
    nextTick(() => {
        pages.value += 1;
    })
}
function deletePage() {
    coursesContent.value.pop();
    nextTick(() => {
        pages.value -= 1;
    })
}
const showNewGroupField = ref(false);
async function createNewGroup() {
    try {
        const { data } = await axios.post(`${base}/fitsphere/groups`, {
            name: groupName.value
        });
        groupName.value = null;
        showNewGroupField.value = false;
        selectGroupValue.value = data.id;
        notify({
            type: 'success',
            title: "Новая группа создана",
        });
    } catch (e) {
        console.log(e)
    }
}
</script>
