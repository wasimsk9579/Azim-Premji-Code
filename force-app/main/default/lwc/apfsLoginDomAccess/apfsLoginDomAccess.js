/**
 * @description       : 
 * @author            : owais.ahanger@cloudodyssey.co
 * @group             : 
 * @last modified on  : 08-11-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
**/
import { LightningElement } from 'lwc';

export default class ApfsLoginDomAccess extends LightningElement {

    username;

    connectedCallback() {
        console.log('connectedCallback - Component is connected to the DOM');
        const urlParams = new URLSearchParams(window.location.search);
        this.username = urlParams.get('username');
        
        if (this.username) {
            console.log('connectedCallback - Username parameter found in URL:', this.username);
        } else {
            console.log('connectedCallback - No username parameter found in URL');
        }
    }


    renderedCallback() {
            //this.username='@applicant.com';
        if (this.username) {
            console.log('renderedCallback - Username is set, attempting to populate the input field');
            this.populateUsernameField();
            this.username = null;
            console.log('renderedCallback - Username handled, preventing further updates');
        } else {
            console.log('renderedCallback - No username to process or already handled');
        }
    }


    populateUsernameField() {        
        const usernameInput = document.querySelector('input[placeholder="Username"]')
        console.log('UserName Input',usernameInput);        
        if (usernameInput) {
            usernameInput.value = this.username;
            console.log('populateUsernameField - Username input field found and populated with:', this.username);
            usernameInput.focus();
            const cursorPosition = this.username.indexOf('@');
            if (cursorPosition !== -1) {
                usernameInput.setSelectionRange(0, cursorPosition);
                console.log('Cursor positioned before "@applicant.com"');
            }
        } else {
            console.log('populateUsernameField - Username input field not found');
        }
        
    }
}