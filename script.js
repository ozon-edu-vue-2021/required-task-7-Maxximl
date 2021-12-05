import { MAX_CONTACTS } from "./constants.js";

const container = document.querySelector("#container");
const contactTemplate = document.querySelector("#contact-template").content.querySelector(".contact__item");
const contactList = document.querySelector(".contacts-list");
const backButton = document.querySelector(".back");
const detailsList = document.querySelector(".details-view__list");

const detailsItemTemplate = document.querySelector("#details-contact-template").content.querySelector(".contact__item");
const peopleTitle = document.querySelector("#details-contact-template").content.querySelector(".people-title");

let sortedAllContacts = [];
let allContactsMap = {};

function getContactsMap(data) {
    const contactsMap = {};

    for (const contact of data) {
        const friendsMap = {};

        for (const friendId of contact.friends) {
            friendsMap[friendId] = friendId;
            
             if(contactsMap[friendId]) {
               if(contactsMap[friendId].popularity) {
                contactsMap[friendId].popularity++;
               } else {
                contactsMap[friendId].popularity = 1;
               }
            } else {
                contactsMap[friendId] = {popularity: 1}
            }
        }
            if(contactsMap[contact.id]) {
                contactsMap[contact.id] = {...contactsMap[contact.id], ...contact, friendsMap}
            } else {
                contactsMap[contact.id] = {...contact, friendsMap, popularity: 0};
            }
    }
    return contactsMap;
}

function prepareContacts(data) {
    allContactsMap = getContactsMap(data);
    console.log(allContactsMap);
    sortedAllContacts = data.sort((a, b) => {
        const leftOperand = allContactsMap[a.id];
        const rightOperand = allContactsMap[b.id];
        if (leftOperand.popularity > rightOperand.popularity) {
            return -1;
        } else if (leftOperand.popularity < rightOperand.popularity) {
            return 1;
        } else {
            if (rightOperand.name > leftOperand.name) {
                return -1;
            } else if (rightOperand.name < leftOperand.name) {
                return 1;
            } else {
                return 0;
            }
        }
    });
    console.log(sortedAllContacts);
}
function getUsers() {
    fetch("./data.json").then(response => response.json()).then((data) => {
        prepareContacts(data);
        renderUsers(data);
    })
}

function renderUsers(contacts) {
    contacts.forEach((contactData) => renderContact(contactData));
}

function createContact(contactData) {
    const contactElement = contactTemplate.cloneNode(true);
    contactElement.textContent = contactData.name;
    contactElement.addEventListener("click", (event) => handleShowDetails(event, contactData))
    return contactElement;
}
function renderDetailItems(items, container) {
    const {friendsItems, notFriendsItems, selebritiesItems} = items;
    const friendsTitleItem = createPeopleTitleItem(peopleTitle, "Друзья");
    const notFriendsTitleItem = createPeopleTitleItem(peopleTitle, "Не в друзьях");
    const selebritiesTitleItem = createPeopleTitleItem(peopleTitle, "Популярные люди");
    const itemsToRender = [friendsTitleItem, ...friendsItems, notFriendsTitleItem, ...notFriendsItems, selebritiesTitleItem, ...selebritiesItems];
    container.replaceChildren(...itemsToRender);
}
function renderContact(contactData) {
    const contact = createContact(contactData);
    contactList.append(contact);
}

function createDetailItem(itemData) {
    const item = detailsItemTemplate.cloneNode(true);
    const itemName = item.querySelector(".name");
    itemName.textContent = itemData.name;
    return item;
}

function renderContactDetails(selectedContactId) {
    const selectedContact = allContactsMap[selectedContactId];

    const friendsItems = [];
    const notFriendsItems = [];
    const selebritiesItems = sortedAllContacts.slice(0, MAX_CONTACTS).map(contact => createDetailItem(contact));

    for (const contactId in allContactsMap) {
        if(contactId == selectedContactId) {
            continue;
        }
        if(friendsItems.length === MAX_CONTACTS && notFriendsItems.length === MAX_CONTACTS) {
            break;
        }

        const contact = allContactsMap[contactId];
        if (selectedContact.friendsMap[contact.id]) {
            if (friendsItems.length === MAX_CONTACTS) {
                continue;
            }
            const friendItem = createDetailItem(contact);
            friendsItems.push(friendItem);
        } else {
            if (notFriendsItems.length === MAX_CONTACTS) {
                continue;
            }
            const notFriendItem = createDetailItem(contact);
            notFriendsItems.push(notFriendItem);
        }
    }

    renderDetailItems({friendsItems, notFriendsItems, selebritiesItems}, detailsList);
}

function createPeopleTitleItem(template, caption) {
    const titleItem = template.cloneNode(true);
    titleItem.textContent = caption;
    return titleItem;
}

function handleShowDetails(event, contactData) {
    renderContactDetails(contactData.id);
    const card = event.target
    container.classList.add("details")
    card.classList.add("active");
}

function handleBackClick() {
    const activeContact = document.querySelector(".active");
    activeContact.classList.remove("active");
    container.classList.remove("details")
}

function initApp() {
    getUsers();

    backButton.addEventListener("click", handleBackClick);
}

initApp();


