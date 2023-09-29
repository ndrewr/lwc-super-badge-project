import { LightningElement } from 'lwc';

import { NavigationMixin } from 'lightning/navigation';

// import getBoats from '@salesforce/apex/BoatDataService.getBoats';

// import { ..., ..., ... } from 'lightning/messageService';
// import BOATMC from '@salesforce/BoatMessageChannel__c';

export default class BoatSearch extends NavigationMixin(LightningElement) {
    isLoading = false;
  
    handleLoading() {
        this.isLoading = true;
     }
    
    handleDoneLoading() {
        this.isLoading = false
    }
    
    async searchBoats(event) { 
        const boatTypeId = event.detail.boatTypeId
        this.template.querySelector("c-boat-search-results").searchBoats(boatTypeId);
        console.log('@@@ Search boats...', event.detail)
    }
    
    createNewBoat() { 
        // uses the NavigationMixin extension to open a standard form so the user can create a new boat record.        
        console.log('@@@ nav to Boat record!');
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Boat__c',
                actionName: 'new'
            }
        });
    }

}