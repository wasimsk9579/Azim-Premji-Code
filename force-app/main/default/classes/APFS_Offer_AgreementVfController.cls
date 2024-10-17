public without sharing class APFS_Offer_AgreementVfController {
     public Id contactId { get; set; }
    public Id applicationId { get; set; }
    public Contact contactRecord { get; set; }
    public Application__c application { get; set; }
     public String firstName { get; set; }
    public String lastName { get; set; } 
    public String fathersName { get; set; } 
    public String mothersName { get; set; } 
    public String Phone { get; set; } 
    public String Email { get; set; } 
    public String communicationAddress { get; set; }
    public String applicationName { get; set; }
    public Offer__c offers { get; set; }
    public Decimal noOfYear { get; set; } 
    public String TodaysDate {get; set;}
    public string offerstartdate {get; set;}
    public string offerenddate {get; set;}
    public string offerdate {get; set;}
     public Integer offerStartYear {get; set;}
    public decimal scholarshipamount {get; set;}
    public String scholarshipAmountInWords { get; set; }
    public Integer scholarshipAmountInt { get; set; }
     public String formattedAmount { get; set; }

  
    
    
  public APFS_Offer_AgreementVfController() {
applicationId = ApexPages.currentPage().getParameters().get('id');
application =[select Id, Name from Application__c Where Id=:applicationId limit 1];
    
     Id contactId = [SELECT Id, Name, 
                            (SELECT Id FROM Applications__r WHERE Id =: applicationId) 
                            FROM Contact 
                            WHERE Id IN (SELECT Contact__c FROM Application__c WHERE Id =: applicationId)
                           ][0].Id;
    
    if (contactId != null) {
                contactRecord = [SELECT Id, FirstName, LastName,Full_Address__c,Father_Full_Name__c,Mother_Full_Name__c,Email,MobilePhone
                                 FROM Contact WHERE Id = :contactId];
        
   

         offers = [Select Id,Application__c,Offer_End_Date__c,Offer_Start_Date__c,Current_Offer__c,CreatedDate,Scholarship_Amount_Per_Annum__c,
                   Net_Course_Duration__c from Offer__c Where Application__c=:applicationId and Current_Offer__c=true order by CreatedDate desc limit 1];  
    

    // Calculate the remaining years
    
        
        noOfYear = offers.Net_Course_Duration__c;
        offerstartdate = (offers.Offer_Start_Date__c != null) ? getFormattedDate(offers.Offer_Start_Date__c) : '';
        offerenddate = (offers.Offer_End_Date__c != null) ? getFormattedDate(offers.Offer_End_Date__c) : '';
        offerStartYear = (offers.Offer_Start_Date__c != null) ? offers.Offer_Start_Date__c.year() : null;
        offerdate = (offers.CreatedDate != null) ? getFormattedDate(offers.CreatedDate.date()) : '';

        
      scholarshipamount=offers.Scholarship_Amount_Per_Annum__c;
      scholarshipAmountInt = Math.floor(scholarshipAmount).intValue(); 
      formattedAmount = String.valueOf(scholarshipAmountInt).replaceAll('(?<=\\d)(?=(\\d{3})+$)', ',');

      scholarshipAmountInWords = convertToWords(scholarshipAmountInt); 
       
       

       
            // Assign values or set blank if null
            firstName = contactRecord.FirstName != null ? contactRecord.FirstName : '';
            lastName = contactRecord.LastName != null ? contactRecord.LastName : '';
            fathersName = contactRecord.Father_Full_Name__c != null ? contactRecord.Father_Full_Name__c : '';
            mothersName = contactRecord.Mother_Full_Name__c != null ? contactRecord.Mother_Full_Name__c : '';
            Email = contactRecord.Email != null ? contactRecord.Email : '';
            Phone = contactRecord.MobilePhone != null ? contactRecord.MobilePhone : '';
            communicationAddress = contactRecord.Full_Address__c != null ? contactRecord.Full_Address__c : '';
            applicationName = application.Name != null ? application.Name : '';
       
}
    }

private static String getFormattedDate(Date parameterDate) {
    if (parameterDate == null) {
        return ''; // Return an empty string or a default value if date is null
    }

    // Retrieve day, month, and year
    Integer day = parameterDate.day();
    Integer month = parameterDate.month();
    Integer year = parameterDate.year();

    // Format day and month with leading zeros if necessary
    String formattedDay = (day < 10 ? '0' : '') + String.valueOf(day);
    String formattedMonth = (month < 10 ? '0' : '') + String.valueOf(month);
    
    // Return formatted date string
    return formattedDay + '/' + formattedMonth + '/' + String.valueOf(year);
}
    
    
    

   // Method to convert a number to words

  private static String convertToWords(Integer scholarshipAmount) {
    if (scholarshipAmount == 0) {
        return 'Zero';
    }

    String[] units = new String[]{
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen'
    };

    String[] tens = new String[]{
        '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    };

    String words = '';

    // Handle thousands
    if (scholarshipAmount >= 1000) {
        words += convertToWords(scholarshipAmount / 1000) + ' Thousand ';
        scholarshipAmount = scholarshipAmount - (scholarshipAmount / 1000) * 1000; // Get the remainder
    }

    // Handle hundreds
    if (scholarshipAmount >= 100) {
        words += units[scholarshipAmount / 100] + ' Hundred ';
        scholarshipAmount = scholarshipAmount - (scholarshipAmount / 100) * 100; // Get the remainder
    }

    // Handle tens and units
    if (scholarshipAmount > 0) {
        if (scholarshipAmount < 20) {
            words += units[scholarshipAmount] + ' ';
        } else {
            words += tens[scholarshipAmount / 10] + ' ';
            Integer remainingUnits = scholarshipAmount - (scholarshipAmount / 10) * 10; // Get the remainder
            if (remainingUnits > 0) {
                words += units[remainingUnits] + ' ';
            }
        }
    }

    return words.trim();
}


    
    
}