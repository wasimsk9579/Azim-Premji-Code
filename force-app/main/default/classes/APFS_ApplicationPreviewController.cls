public without sharing class APFS_ApplicationPreviewController {
    public Id contactId { get; set; }
    public Id applicationId { get; set; }
    public Contact contactRecord { get; set; }
    public List<Bank_Detail__c> BankDetails {get; set;}
    public String TodaysDate {get; set;}
    public List<Admission__c> admissions { get; set; } // Change to List
    
     public Application__c application { get; set; }
      
    // Basic details
    public String decryptedDataString {get;set;}
    public Bank_Detail__c BankDetail {get; set;}
    public String firstName { get; set; }
    public String lastName { get; set; }
    public String aadhaarNumber { get; set; }
    public String email { get; set; }
    public String gender { get; set; }
    public String mobilePhone { get; set; }
    public String birthDate { get; set; }
    public String state { get; set; }
    public String refdistrict { get; set; }
    public String communicationAddress { get; set; }
    public String userPinCode { get; set; }
    
    // Class Eight fields
    public String classEightBoardName { get; set; }
    public String classEightOtherBoardName { get; set; }    
    public String classEightEducationMode { get; set; }
    public String classEightExamCentreDistrict { get; set; }
    public String classEightExamCentrePincode { get; set; }
    public String classEightExamCentreState { get; set; }
    public String classEightSchoolName { get; set; }
    public String classEightOtherSchoolName { get; set; }
    public Decimal classEightPassPercentage { get; set; }
    public String classEightYearOfPassing { get; set; }
    public String classEightExamCenter { get; set; }
    
    // Class Ten fields
    public String classTenBoardName { get; set; }
    public String classTenEducationMode { get; set; }
    public String classTenExamCentreDistrict { get; set; }
    public String classTenExamCentrePincode { get; set; }
    public String classTenExamCentreState { get; set; }
    public String classTenSchoolName { get; set; }
    public String classTenOtherSchoolName { get; set; }
    public String classTenOtherBoardName { get; set; }  
    public Decimal classTenPassPercentage { get; set; }
    public String classTenYearOfPassing { get; set; }
    public String classTenExamCenter { get; set; }
    
    // Class Twelve fields
    public String classTwelveBoardName { get; set; }
    public String classTwelveOtherBoardName { get; set; }   
    public String classTwelveEducationMode { get; set; }
    public String classTwelveExamCentreDistrict { get; set; }
    public String classTwelveExamCentrePincode { get; set; }
    public String classTwelveExamCentreState { get; set; }
    public String classTwelveSchoolName { get; set; }
    public String classTwelveOtherSchoolName { get; set; }
    public Decimal classTwelvePassPercentage { get; set; }
    public String classTwelveYearOfPassing { get; set; }
    public String classTwelveExamCenter { get; set; }
    
    // Socio-Economic details
    public String typeOfDisability { get; set; }
    public String otherDisabilityType { get; set; }
    public String speciallyAbled { get; set; }
    public String category { get; set; }
    public String otherCategory { get; set; }
    public String familyStatus { get; set; }
    public String familyIncome { get; set; }
    public String religion { get; set; }
    public String otherReligion { get; set; }
    public String communityName { get; set; }
    public String motherName { get; set; }
    public String fatherName { get; set; }
    
    // Admission details
    public String collegestate { get; set; }
    public String collegedistrict { get; set; }
    public String collegename { get; set; }
    public String othercollegename { get; set; }
    public String coursename { get; set; }
    public String yearofadmission { get; set; }
    public String coursetype { get; set; }
    public String coursecategory {get; set;}
    public String coursesystem {get;set;}
    public String courseduration { get; set; }
    public String coursestartdate { get; set; }
    public String courseofyear { get; set; }
    public String residencedetail { get; set; }
    public String otherresidencedetail { get; set; }
    public String clgstudentid { get; set; }
    
    // Referral details
    public String referred { get; set; }
    public String refState { get; set; }
    public String refPartnerName { get; set; }
    public String refFullName { get; set; }
    
    public APFS_ApplicationPreviewController() {
        try{
         
            // Retrieve parameters from the URL
            applicationId = ApexPages.currentPage().getParameters().get('id');
             application =[select Id, Is_Consent_Given__c from Application__c Where Id=:applicationId limit 1];
         
            // Query to get contactId based on applicationId
            Id contactId = [SELECT Id, Name, 
                            (SELECT Id FROM Applications__r WHERE Id =: applicationId) 
                            FROM Contact 
                            WHERE Id IN (SELECT Contact__c FROM Application__c WHERE Id =: applicationId)
                           ][0].Id;
            
  
            
          
            // Query contact record
            if (contactId != null) {
                contactRecord = [SELECT Id, FirstName, LastName, Aadhaar_Number__c, GenderIdentity, Birthdate, Email, MobilePhone, Community_Name__c, Mother_Full_Name__c, Father_Full_Name__c, State__c, District__c, Full_Address_Pin_Code__c, Full_Address__c, Referral_Partner_State__c, Referral_Partner_Name__c,
                                 Referral_Full_Name__c, Class_Twelve_Board_Name__c, Class_Ten_Board_Name__c, Class_Eight_Board_Name__c, Referred_By_APF_Or_Partners__c, Class_Eight_Exam_Center_Block__c, Other_Religion__c, Other_Category__c,
                                 Class_Eight_Education_Mode__c, Class_Eight_Exam_Centre_District__c, Class_Eight_Exam_Centre_Pincode__c, Class_Eight_Exam_Centre_State__c, Class_Eight_Name_Of_School__c, Class_Eight_Other_Name_Of_School__c, Class_Eight_Pass_Percentage__c, Class_Eight_Year_Of_Passing__c,Class_Eight_Other_Board_Name__c,
                                 Class_Ten_Education_Mode__c, Class_Ten_Exam_Center_Block__c, Class_Ten_Exam_Centre_District__c, Class_Ten_Exam_Centre_Pincode__c, Class_Ten_Exam_Centre_State__c, Class_Ten_Name_Of_School__c, Class_Ten_Other_Name_Of_School__c, Class_Ten_Pass_Percentage__c, Class_Ten_Year_Of_Passing__c,
                                 Class_Twelve_Exam_Center_Block__c, Class_Twelve_Education_Mode__c, Class_Twelve_Exam_Centre_District__c, Class_Twelve_Exam_Centre_Pincode__c, Class_Twelve_Exam_Centre_State__c, Class_Twelve_Name_Of_School__c, Class_Twelve_Other_Name_Of_School__c, Class_Twelve_Pass_Percentage__c, Class_Twelve_Year_Of_Passing__c,Class_Ten_Other_Board_Name__c,Class_Twelve_Other_Board_Name__c,
                                 Type_Of_Disablity__c, Other_Disability_Type__c, Specially_Abled__c, Category__c, Current_Family_Status__c, Family_Income_Per_Year__c, 
                                 Religion__c
                                 FROM Contact WHERE Id = :contactId];
                
                BankDetails = [SELECT Id,Contact__c, Name,Branch_Name__c,Bank_Ifsc_Code__c,Encrypted_Bank_Account_Number__c FROM Bank_Detail__c WHERE Contact__c = :contactId LIMIT 1];
                
                if(BankDetails.size()>0){
                    BankDetail = BankDetails[0];
                    Blob cryptoKey = Crypto.generateAesKey(256);        
                    Blob data = Blob.valueOf(BankDetails[0].Encrypted_Bank_Account_Number__c);
                    Blob encryptedData = Crypto.encryptWithManagedIV('AES256', cryptoKey, data);        
                    Blob decryptedData = Crypto.decryptWithManagedIV('AES256', cryptoKey, encryptedData);
                    decryptedDataString = decryptedData.toString();
                }
                // Basic detail fields
                firstName = contactRecord.FirstName;
                lastName = contactRecord.LastName;
                aadhaarNumber = contactRecord.Aadhaar_Number__c;
                email = contactRecord.Email;
                TodaysDate = getFormattedDate(Date.today());
                //  email = contactRecord.email.replace('@', '<br/>@').replace('.', '.<br/>');
                gender = contactRecord.GenderIdentity;
                mobilePhone = contactRecord.MobilePhone;
                
                birthDate = getFormattedDate(contactRecord.Birthdate);
                state = contactRecord.State__c;
                refdistrict = contactRecord.District__c;
                communicationAddress = contactRecord.Full_Address__c;
                userPinCode = contactRecord.Full_Address_Pin_Code__c;
                
                // Class Eight fields
                classEightBoardName = contactRecord.Class_Eight_Board_Name__c;
                classEightOtherBoardName = contactRecord.Class_Eight_Other_Board_Name__c;
                classEightEducationMode = contactRecord.Class_Eight_Education_Mode__c;
                classEightExamCentreDistrict = contactRecord.Class_Eight_Exam_Centre_District__c;
                classEightExamCentrePincode = contactRecord.Class_Eight_Exam_Centre_Pincode__c;
                classEightExamCentreState = contactRecord.Class_Eight_Exam_Centre_State__c;
                classEightSchoolName = contactRecord.Class_Eight_Name_Of_School__c;
                classEightOtherSchoolName = contactRecord.Class_Eight_Other_Name_Of_School__c;
                classEightPassPercentage = contactRecord.Class_Eight_Pass_Percentage__c;
                classEightYearOfPassing = contactRecord.Class_Eight_Year_Of_Passing__c;
                classEightExamCenter = contactRecord.Class_Eight_Exam_Center_Block__c;
                //referral fields
                referred=contactRecord.Referred_By_APF_Or_Partners__c;
                refpartnername=contactRecord.Referral_Partner_Name__c;
                refstate=contactRecord.Referral_Partner_State__c;
                reffullname=contactRecord.Referral_Full_Name__c;
                
                // Class Ten fields
                classTenBoardName = contactRecord.Class_Ten_Board_Name__c;
                classTenOtherBoardName = String.isBlank(contactRecord.Class_Ten_Other_Board_Name__c)?'':contactRecord.Class_Ten_Other_Board_Name__c;
                System.debug('classTenOtherBoardName=> '+classTenOtherBoardName);
                classTenEducationMode = contactRecord.Class_Ten_Education_Mode__c;
                classTenExamCentreDistrict = contactRecord.Class_Ten_Exam_Centre_District__c;
                classTenExamCentrePincode = contactRecord.Class_Ten_Exam_Centre_Pincode__c;
                classTenExamCentreState = contactRecord.Class_Ten_Exam_Centre_State__c;
                classTenSchoolName = contactRecord.Class_Ten_Name_Of_School__c;
                classTenOtherSchoolName = contactRecord.Class_Ten_Other_Name_Of_School__c;
                classTenPassPercentage = contactRecord.Class_Ten_Pass_Percentage__c;
                classTenYearOfPassing = contactRecord.Class_Ten_Year_Of_Passing__c;
                classTenExamCenter = contactRecord.Class_Ten_Exam_Center_Block__c;
                
                // Class Twelve fields
                classTwelveBoardName = contactRecord.Class_Twelve_Board_Name__c;
                classTwelveOtherBoardName = contactRecord.Class_Twelve_Other_Board_Name__c;
                classTwelveEducationMode = contactRecord.Class_Twelve_Education_Mode__c;
                classTwelveExamCentreDistrict = contactRecord.Class_Twelve_Exam_Centre_District__c;
                classTwelveExamCentrePincode = contactRecord.Class_Twelve_Exam_Centre_Pincode__c;
                classTwelveExamCentreState = contactRecord.Class_Twelve_Exam_Centre_State__c;
                classTwelveSchoolName = contactRecord.Class_Twelve_Name_Of_School__c;
                classTwelveOtherSchoolName = contactRecord.Class_Twelve_Other_Name_Of_School__c;
                classTwelvePassPercentage = contactRecord.Class_Twelve_Pass_Percentage__c;
                classTwelveYearOfPassing = contactRecord.Class_Twelve_Year_Of_Passing__c;
                classTwelveExamCenter = contactRecord.Class_Twelve_Exam_Center_Block__c;
                
                // Socio-Economic details
                typeOfDisability = contactRecord.Type_Of_Disablity__c;
                otherDisabilityType = contactRecord.Other_Disability_Type__c;
                speciallyAbled = contactRecord.Specially_Abled__c;
                category = contactRecord.Category__c;
                otherCategory = contactRecord.Other_Category__c;
                familyStatus = contactRecord.Current_Family_Status__c;
                familyIncome = contactRecord.Family_Income_Per_Year__c;
                religion = contactRecord.Religion__c;
                otherReligion = contactRecord.Other_Religion__c;
                communityName = contactRecord.Community_Name__c;
                motherName = contactRecord.Mother_Full_Name__c;
                fatherName = contactRecord.Father_Full_Name__c;
                
                
                System.debug('contactId=> '+contactId+' ApplicationId=> '+applicationId);
                // Admission details
                admissions = [SELECT Name, Name_Of_The_Institute__c, Other_Name_Of_Institute__c, Course_Name__c,
                              Year_Of_Admission__c, Course_Duration_In_Years__c, Institute_State__c, Institute_District__c,
                              Course_Type__c, Course_Start_Date__c, Course_Year_Of_Studying__c, 
                              Contact__c,Course_Category__c,Course_System__c,Other_Course_Category__c
                              FROM Admission__c  
                              WHERE Contact__c = :contactId AND Application__c = :applicationId];
                
                System.debug('admissions list'+admissions);
                
                // Handle admissions if necessary
                if (admissions != null && !admissions.isEmpty()) {
                    List<String> dateParts = admissions[0].Course_Start_Date__c.split('-');
                    
                    // Extract the year and month
                    String year = dateParts[0];
                    String month = dateParts[1];
                    
                    // Convert it to the desired format (MM/yyyy)
                    coursestartdate = month + '/' + year;
                  
                }
            }
        }
        catch(Exception e)
        {
            System.debug('Line=> '+e.getLineNumber()+' Message=> '+e.getMessage());
        }
    }
    
    private static String getFormattedDate(Date ParameterDate){
        String formattedDate = String.valueOf(ParameterDate.day()) + '/' + 
            String.valueOf(ParameterDate.month()) + '/' + 
            String.valueOf(ParameterDate.year());
        
        return formattedDate;
    }
}