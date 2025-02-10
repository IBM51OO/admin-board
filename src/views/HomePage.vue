<template>
    <div class="courses">
        <div class="container">
            <div class="courses__title">
                курсы
            </div>
            <div class="courses__filter">
                <span>Фильтр по группе</span>
                <VueSelect
                    v-model="selected"
                    :is-multi="false"
                    :options="groupOptionSelect"
                />
            </div>
            <div class="courses__list">
                <div class="course-add" @click="openCreatePopup">
                    <div class="course-add__wrapper">
                        <div class="course-add__label">
                            Создать новый курс
                        </div>
                    </div>
                </div>
                <div class="course" v-for="course in filteredCourses" :key="course.id">
                    <div class="course__wrapper">
                        <div class="course__img-wrapper">
                            <div class="course__img">
                                <img :src="`${base}/fitsphere/image/${course.images[course.images.length - 1]}`" alt="" v-if="course.images.length">
                                <label :for="`courseFile-${course.id}`">
                                    <span class="course__upload-img">
                                        <PlusIcon />
                                    </span>
                                    <input :id="`courseFile-${course.id}`" type="file" @change="uploadImage($event, course.id)" v-show="false">
                                </label>
                            </div>
                        </div>
                        <div class="course__title">
                            {{ course.name }}
                        </div>
                        <div class="course__description">
                            {{ course.description }}
                        </div>
                    </div>
                    <div class="course__buttons">
                        <button @click="openDeleteModal(course.id)">Удалить</button>
                        <button @click="editCourse(course.id)">Редактировать</button>
                    </div>
                </div>
            </div>
        </div>
        <popup v-model="createCoursePopup">
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
                            <div class="new-course__delete-group"  v-if="courseData.groups && courseData.groups !== 'newGroup'" @click="deleteGroup">
                                Удалить группу
                            </div>
                            <ErrorMessage name="groups"/>
                            <Field name="groupField" v-if="courseData.groups === 'newGroup'" placeholder="Название группы" v-model="groupName" />
                            <div @click="createNewGroup"><img src="../img/check.png" alt="" v-if="groupName"></div>
                        </div>
                        <div class="new-course__group-image" v-if="courseData.groups">
                            <span>Обновить фото группы</span>
                            <input type="file" id="avatar" ref="groupFile" name="avatar" accept="image/png, image/jpeg" @change="uploadGroupImage"  />
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
                        <Field name="content" placeholder="Предварительный контент курса" v-model="courseData.content"/>
                        <ErrorMessage name="content"/>
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
        </popup>
    </div>
</template>
<script setup>
import {Field, Form, ErrorMessage, useForm} from 'vee-validate';
import axios from "axios";
import {notify} from "@kyvg/vue3-notification";
import {openModal} from "jenesius-vue-modal";
import * as yup from 'yup';
import Popup from "@/components/Popup.vue";
import {computed, nextTick, reactive, ref, watch} from "vue";
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { QuillEditor } from '@vueup/vue-quill'
import DeleteModal from "@/components/DeleteModal.vue";
import PlusIcon from "@/img/svg/plus.svg?component";
import DeleteIcon from "@/img/svg/delete.svg?component";
import VueSelect from "vue3-select-component";
const createCoursePopup = ref(false);
const selected = ref();
const showNewGroupField = ref(false);
const pages = ref(1);
const courses = ref();
const filteredCourses = computed(() => courses.value && selected.value ? courses.value.filter((el) => el.group === selected.value): courses.value)
const coursesContent = ref([
    {
        title: ' ',
        text: ' ',
    }
]);
watch(selected, (val) => {
    console.log('fewfw')
})
const groupName = ref();
const groups = ref(null);
const deleteGroup = async () => {
    try {
        await axios.delete(`${base}/fitsphere/groups/${courseData.groups}`)
        notify({
            type: 'success',
            title: "Группа удалена",
        });
        groups.value = groups.value.filter((el) => el.id !== courseData.groups);
        selectGroupValue.value = '';
        courseData.groups = '';
    } catch (e) {
        console.log(e);
    }
}
const selectGroupValue = ref('');
const base = import.meta.env.VITE_BASE_API;
const secondBase = import.meta.env.VITE_SECOND_API;
const schema =  yup.object({
    name: yup.string().required('Name is a required field'),
    content: yup.string().required('Name is a required field'),
    groups: yup.string().required('Required field'),
    price: yup.string().required('Price is a required field'),
    priceSecond: yup.string().required('Price is a required field'),
    description: yup.string().required('Description is a required field'),
});
const courseData = reactive({
    name: '',
    groups: '',
    content: '',
    price: '',
    priceSecond: '',
    description: '',
    images: [],
});
const { setErrors, handleSubmit } = useForm({
    validationSchema: schema,
});
const uploadImage = async (e, id) => {
    const formData = new FormData();
    if (e.target.files && e.target.files.length) {
        try {
            formData.append('img', e.target.files[0])
            await axios.post(`${base}/fitsphere/products/${id}/image`, formData);
            notify({
                type: 'success',
                title: "Фото обновлено",
            });
            fetchCourses();
        } catch (e) {
            console.log(e);
        }
    }
}
const textContent = ref();
const editedCourse = ref();
const groupFile = ref();
const groupOptionSelect = computed(() => groups.value && groups.value.map((el) => {return {label: el.name, value: el.id, ...el}}))
const modal = ref();
const editCourseId = ref(false);
fetchCourses();
fetchGroups();
async function createNewGroup() {
    try {
        const { data } = await axios.post(`${base}/fitsphere/groups`, {
            name: groupName.value
        });
        groupName.value = null;
        showNewGroupField.value = false;
        selectGroupValue.value = data.id;
        await fetchGroups();
        notify({
            type: 'success',
            title: "Новая группа создана",
        });
    } catch (e) {
        console.log(e)
    }
}
function uploadGroupImage(e) {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('img', file);
    axios.post(`${base}/fitsphere/groups/${selectGroupValue.value}/image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    groupFile.value.type = "text";
    groupFile.value.type = "file";
    notify({
        type: 'success',
        title: "Фото группы обновлено",
    });
}
 async function openDeleteModal(id) {
    modal.value = await openModal(DeleteModal);
    modal.value.on('delete', async (v) => {
        await deleteCourse(id);
        await fetchCourses();
        modal.value.close();
    })
}
async function deleteCourse(id) {
    try {
        await axios.delete(`${base}/fitsphere/products/${id}`);
        notify({
            type: 'success',
            title: "Курс удален",
        });
    } catch (e) {
        console.log(e)
    }
}
async function editCourse(id) {
    const {data} = await axios.get(`${base}/fitsphere/products/${id}`);
    editCourseId.value = id;
    editedCourse.value = data;
    courseData.description = data.description;
    courseData.name = data.name;
    courseData.groups = data.group;
    courseData.images = data.images;
    courseData.content = data.content;
    courseData.price = data.prices[0]?.amount;
    courseData.priceSecond = data.prices[1]?.amount;
    coursesContent.value = [];
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
    selectGroupValue.value = data.group;
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
async function fetchGroups() {
    const { data } = await axios.get(`${base}/fitsphere/groups`);
    groups.value = data;
}
async function onSubmit(data) {
    if (data.groups === 'newGroup') {
        return;
    }
    try {
        const apiUrl = editCourseId.value ? `${base}/fitsphere/products/${editCourseId.value}` : `${base}/fitsphere/products`;
        await axios.post(apiUrl, {
            name: data.name,
            content: data.content,
            description: data.description,
            period: 0,
            images: courseData.images,
            group: data.groups,
            table_of_contents: 'Test',
            pages: coursesContent.value.map((el, index) => {
                return {
                    title: el.title ? el.title : 'None',
                    text: textContent.value[index].getHTML(),
                }
            }),
            prices: [
                {
                    amount: data.price,
                    currency: 'GBP',
                },
                {
                    amount: data.priceSecond,
                    currency: 'EUR',
                },
            ]
        })
        notify({
            type: 'success',
            title: "Курс создан",
        });
        createCoursePopup.value = false;
        fetchCourses();
    } catch (e)  {
        console.log(e);
    }
}
function openCreatePopup() {
    selectGroupValue.value = '';
    editedCourse.value = null;
    createCoursePopup.value = true;
    pages.value = 1;
    coursesContent.value = [
        {
            title: ' ',
            text: ' ',
        }
    ];
    courseData.images = [];
    courseData.price = '';
    courseData.groups = '';
    courseData.name = '';
    courseData.description = '';
    courseData.priceSecond = '';
    courseData.contentDescription = '';

    fetchGroups();
}
async function fetchCourses() {
   try {
       const {data} = await axios.get(`${secondBase}/courses`);
       courses.value = data;
   } catch (e) {
       console.log(e);
   }
}
function onChangeGroup(value) {
    selectGroupValue.value = value.target.value;
    showNewGroupField.value = value.target.value === 'newGroup';
}
</script>
<style lang="scss">
    .modal-container {
        z-index: 99;
    }
    .courses {
        &__filter {
            max-width: 300px;
            margin-left: auto;
            padding-right: 20px;
            span {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                text-align: right;
            }
            .control {
                border: 1px solid #969696;
            }
        }
        &__list {
            display: flex;
            flex-wrap: wrap;
            row-gap: 44px;
        }
        &__title {
            font-size: 48px;
            color: #000;
            margin-bottom: 40px;
            text-align: center;
            font-weight: 500;
            display: flex;
            align-items: center;
        }
        .container {
            max-width: 1280px;
            margin: 0 auto;
            width: 100%;
        }
        .course {
            width: 25%;
            position: relative;
            padding: 20px;
            &__wrapper {
                background-color: #e5e5e3;
                padding: 20px;
                height: 100%;
            }
            &__img-wrapper {
                width: 100%;
                display: flex;
                justify-content: center;
                text-align: center;
            }
            &__delete-img {
                cursor: pointer;
                position: absolute;
                scale: 0.5;
                top: 40px;
                right: -76px;
            }
            &__upload-img {
                cursor: pointer;
                position: absolute;
                height: 50px;
                width: 50px;
                top: -10px;
                right: -50px;
            }
            &__img {
                position: relative;
                height: 150px;
                width: 150px;
                background: gray;
                img {
                    height: 100%;
                    width: 100%;
                    object-fit: contain;
                }
            }
            &__buttons {
                display: flex;
                padding: 0 50px;
                margin-top: 10px;
                justify-content: space-between;
                button {
                    cursor: pointer;
                    color: #383838;
                    background: none;
                    border: none;
                }
            }
            &__title {
                text-align: center;
                margin-top: 20px;
                font-weight: 500;
                font-size: 28px;
            }
            &__description {
                max-height: 300px;
                color: #383838;
                font-size: 14px;
                overflow: hidden;
            }
        }
        .course-add {
            width: 25%;
            padding: 20px;
            &__wrapper {
                background-color: #e5e5e3;
                padding: 20px;
                height: 100%;
            }
            &__label {
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100%;
                font-size: 36px;
                text-align: center;
            }
        }
    }
    .new-course {
        max-width: 1000px;
        margin: 0 auto;
        &__content-description {
            margin-top: 20px;
            input {
                margin-left: 10px;
            }
        }
        &__delete-group {
            cursor: pointer;
            margin-left: 10px;
        }
        &__header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            button {
                background: none;
                border: none;
            }
        }
        &__group-wrapper {
            margin-bottom: 20px;
        }
        &__group-image {
            margin-top: 10px;
            span {
                margin-right: 10px;
            }
        }
        &__groups {
            display: flex;
            align-items: center;
            input {
                margin-left: 10px;
            }
            img {
                height: 15px;
                width: 15px;
                cursor: pointer;
                margin-left: 10px;
            }
        }
        &__title {
            font-size: 32px;
            font-weight: 500;
            display: flex;
            align-items: center;
            input {
                height: 24px;
                max-width: 180px;
                margin-left: 20px;
                border: 1px solid #000;
                font-size: 14px;
            }
            input[type='text']{
                font-size: 14px;
                color: rgba(255, 255, 255, 0.4);
                line-height: 30px;
            }
        }
        &__price, &__price-second {
            input {
                margin-left: 10px;
                font-size: 14px;
                width: 50px;
            }

            margin-bottom: 20px;
        }
        &__content {
            //min-height: 100vh;
            margin-bottom: 20px;
            margin-top: 20px;
        }
        .quill-editor {
            min-height: 400px; /* Set your desired height */
        }
        &__description {
            .quill-editor {
                height: 100%; /* Set your desired height */
                min-height: 100%;
            }
            input {
                margin-left: 10px;
            }
        }
        &__content-title {
            margin: 10px 0;
            input {
                margin-left: 10px;
            }
        }
        .ally-button {
            display: inline;
            background-color: #ffffff;
            border: 1px solid rgb(209, 213, 219);
            border-radius: 0.5rem;
            color: #111827;
            font-size: 0.875rem;
            font-weight: 600;
            line-height: 1.25rem;
            padding: 0.75rem 1rem;
            text-align: center;
            -webkit-box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            cursor: pointer;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-user-select: none;
            -ms-touch-action: manipulation;
            touch-action: manipulation;
            margin-left: 10px;
        }
        .ally-button:hover {
            background-color: #f9fafb;
        }
        .ally-button:focus {
            outline: 2px solid rgba(0, 0, 0, 0.1);
            outline-offset: 2px;
        }
        .ally-button:focus-visible {
            -webkit-box-shadow: none;
            box-shadow: none;
        }
    }
</style>
