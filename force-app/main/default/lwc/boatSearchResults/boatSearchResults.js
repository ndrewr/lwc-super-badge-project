import { LightningElement, api, wire } from 'lwc';

import { refreshApex } from '@salesforce/apex';

import { publish, MessageContext } from 'lightning/messageService';

import { ShowToastEvent } from "lightning/platformShowToastEvent";

import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';

const COLUMNS = [
  { label: 'Name', fieldName: 'Name', editable: true },
  { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
  { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
  { label: 'Description', fieldName: 'Description__c', editable: true }
];

export default class BoatSearchResults extends LightningElement {
  selectedBoatId;
  columns = [ ...COLUMNS ];
  boatTypeId = '';
  boats;
  isLoading = false;
  
  // wired message context
  @wire(MessageContext)
  messageContext;
  // wired getBoats method 
  @wire(getBoats, { boatTypeId: '$boatTypeId' })
  wiredBoats(result) {
    const { error, data } = result;
    if (data) {
      console.log('@@@ wiredBoats', data);
      this.boats = result;
      // this.boats = data;
    } else if (error) {
      this.boats = undefined;
      this.error = error;
    }
    this.notifyLoading(false);

  }
  
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) {
    console.log('@@@ searchBoats', boatTypeId)
    this.boatTypeId = boatTypeId;
    this.notifyLoading(true);
  }
  
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api
  async refresh() {
    console.log('@@@ refresh');
    await refreshApex(this.boats);
    this.isLoading = false;
    this.notifyLoading(false);
  }
  
  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
    console.log('@@@ updateSelectedTile', event.detail.boatId);
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    // explicitly pass boatId to the parameter recordId
    const payload = { recordId: boatId };
    publish(this.messageContext, BOATMC, payload);
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    // notify loading
    this.notifyLoading(true);
    // Update the records via Apex
    const updatedFields = event.detail.draftValues;
    console.log('@@@ handleSave', Object.keys(updatedFields));
    updateBoatList({data: updatedFields})
    .then(() => {
      console.log('@@@ Updated boat list');
      this.refresh();
      // this.showToast()
      this.dispatchEvent(
        new ShowToastEvent({
          title: SUCCESS_TITLE ,
          message: MESSAGE_SHIP_IT,
          variant: SUCCESS_VARIANT
        })
      );
  
    })
    .catch(error => {
      console.log('@@@ Error in handleSave', error);
      // this.showToast({title: ERROR_TITLE, variant: ERROR_VARIANT, message: error.body.message});
      this.dispatchEvent(
        new ShowToastEvent({
          title: ERROR_TITLE ,
          message: error.body.message,
          variant: ERROR_VARIANT
        })
      );
  
    })
    .finally(() => {
      this.template.querySelector("lightning-datatable").draftValues = [];
      // this.isLoading = false;
      // this.notifyLoading(this.isLoading);
    });
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    const eventType = isLoading ? 'loading' : 'doneloading';
    this.dispatchEvent(new CustomEvent(eventType));
  }

  // Show lightning toast w/ given title, message, and variant
  showToast({ title, message, variant } = {}) {
    this.dispatchEvent(
      new ShowToastEvent({
        title: title || SUCCESS_TITLE ,
        message: message || MESSAGE_SHIP_IT,
        variant: variant || SUCCESS_VARIANT
      })
    );
  }
}
