//
//  attendViewController.swift
//  With Attend
//
//  Created by Joshua Unrau on 2016-03-24.
//  Copyright © 2016 GreenDotDev. All rights reserved.
//
import UIKit
import CoreBluetooth
import SwiftDDP
import Firebase

struct attendViewControllerConstant {
    static let storedItemsKey = "storedItems"
}

struct siteData{
    var verified: Bool
    var site: AnyObject
}

class attendViewController: UIViewController, CLLocationManagerDelegate, CBPeripheralManagerDelegate {
    var debugMode = false;
    var items: [Item] = []
    var bluetoothPeripheralManager: CBPeripheralManager?
    var loading = true
    var appeared = false
    var onSiteBool = false
    var atWorkBool = false
    var lastDiscoveredBeaconMinor: Int = 0
    var lastDiscoveredBeaconMajor: Int = 0
    var jobsiteName = String()
    var COMPANY_ID = UserDefaults.standard.value(forKey: "companyId")
    var USER_ID = UserDefaults.standard.value(forKey: "userId")
    var time = Date().timeIntervalSince1970
    var differenceWithDashboard = false
    let locationManager = CLLocationManager()
    let progressHUD = ProgressHUD(text: "Loading")
    let beaconRegion =  CLBeaconRegion(proximityUUID: UUID(uuidString: "F7826DA6-4FA2-4E98-8024-BC5B71E0893E")!, identifier: "Kontakt")
    let beacon = Item(name: "Kontakt", uuid: UUID(uuidString:"F7826DA6-4FA2-4E98-8024-BC5B71E0893E")!)
    
    override func viewWillAppear(_ animated: Bool){
        if(appeared){return}
        print("view will appear.")
        appeared = true
        initialise()
    }
    
    func viewDidBecomeActive(_ application: UIApplication) {
        if(appeared){return}
        NSLog("View became active")
        appeared = true
        initialise()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        if(appeared){return}
        NSLog("View appeared")
        appeared = true
        initialise()
    }
    
    override func viewWillDisappear(_ animated: Bool)
    {
        super.viewWillDisappear(animated)
        self.navigationController?.isNavigationBarHidden = true
    }
    
    //ELEMENTS----------------------------
    @IBOutlet weak var menuButton: UIBarButtonItem!
    @IBOutlet weak var userStatusButtonOutlet: UIButton!
    @IBAction func Logout(_ sender: AnyObject) {
        Meteor.logout()
    }
    @IBAction func userStatusButton(_ sender: AnyObject)
    {
        NSLog("Pressing button")
        syncOnSiteWithDashboard()
        //Check that the App and dashboard agree on if the user is checked-in
        if(differenceWithDashboard){
            print("there is a difference with the dashboard")
            differenceWithDashboard = false;
            return
        }
        if(!Meteor.client.loggedIn()){
            print("You are not logged in")
            return
        }
        //setting up the checkin button
        var buttonType = 0;
        var statusFunction = "events.checkOutDevice";
        let timestamp = DateFormatter.localizedString(from: Date(), dateStyle: .medium, timeStyle: .short);
        NSLog(timestamp);
        if(UserDefaults.standard.bool(forKey: "buttonType"))// yes button
        {
            buttonType = 1;//logging into site
            statusFunction = "events.checkInDevice";
        }
        
        //progress/loader messages
        var progressView : UIProgressView?
        let alertView = UIAlertController(title: "Please wait", message: "Uploading your log.", preferredStyle: .alert)
        DispatchQueue.main.asyncAfter(deadline: .now() + .seconds(5)) {
            if(alertView.isBeingPresented)
            {
                showUploadFail()
            }
            alertView.dismiss(animated: true, completion: nil)
        }
        present(alertView, animated: true, completion: {
            //  Add your progressbar after alert is shown (and measured)
            let margin:CGFloat = 8.0
            let rect = CGRect(x: margin, y: 72.0, width: alertView.view.frame.width - margin * 2.0 , height: 2.0)
            progressView = UIProgressView(frame: rect)
            progressView?.progress = 0.1
            progressView?.tintColor = UIColor.blue
            alertView.view.addSubview(progressView!)
        })
        
        
        if(Meteor.client.loggedIn())
        {
            print("logged in")
            progressView?.progress = 0.5
            let data: [String : AnyObject] = [
                "time" : timestamp as AnyObject,
                "userId" : USER_ID! as AnyObject,
                "beaconMinor" : String(lastDiscoveredBeaconMinor) as AnyObject,
                "beaconMajor" : String(lastDiscoveredBeaconMajor) as AnyObject,
                "companyId" : COMPANY_ID! as AnyObject,
                "eventType" : buttonType as AnyObject
            ]
            print(data)
            self.login()
            Meteor.call(name: statusFunction, params: [data as AnyObject]) { result, error in
                // Do something with the method result
                progressView?.progress = 0.9
                NSLog("call connected")
                if(error == nil)
                {
                    //save was successful
                    NSLog("Successfully saved event in foreground.");
                    progressView?.progress = 1
                    alertView.dismiss(animated: true, completion: nil)
                    let message = ""+String(timestamp)
                    if(buttonType == 1){
                        UserDefaults.standard.set(true, forKey: CHECKED_IN)
                        let alert = UIAlertView(title:
                            NSLocalizedString("You have been signed into work", comment: ""),
                                                message: message,
                                                delegate: nil,
                                                cancelButtonTitle: NSLocalizedString("OK", comment: "OK")
                        )
                        print("User says they are at work")
                        self.createWorkNofification()
                        alert.show()
                    }
                    else {
                        UserDefaults.standard.set(false, forKey: CHECKED_IN)
                        alertView.dismiss(animated: true, completion: nil)
                        let message = ""+String(timestamp)
                        let alert = UIAlertView(
                            title: NSLocalizedString("You have been signed out of work", comment: ""),
                            message: message,
                            delegate: nil,
                            cancelButtonTitle: NSLocalizedString("OK", comment: "OK")
                        )
                        print("User says they are not at work")
                        self.removeWorkNofication()
                        alert.show()
                    }
                    self.updateUI()
                }
                else {
                    //save failed
                    print(error?.error)
                    if(error?.error == "not-authorized")
                    {
                        self.segueToLogin();
                        self.login()
                        NSLog("Save failed, with error: "+String(describing: error))
                        return;
                    }
                    let message = "A error occured uploading your log."
                    let alert = UIAlertView(
                        title: NSLocalizedString("Error!", comment: ""),
                        message: message,
                        delegate: nil,
                        cancelButtonTitle: NSLocalizedString("OK", comment: "OK")
                    )
                    alert.show()
                    NSLog("Save failed, with error: "+String(describing: error))
                    alertView.dismiss(animated: true, completion: nil)
                }
            }
        }
        else {
            NSLog("User not logged in.")
            alertView.dismiss(animated: true, completion: nil)
            self.login()
        }
    }
    
    //==================================== Functions
    //TODO: Change to send notification at 5PM
    func createWorkNofification(){
        let notificationTime = (Calendar.current as NSCalendar).date(byAdding: .hour,value: 8,to:  Date(),options:NSCalendar.Options.matchStrictly)
        NSLog("Notification will arrive at: "+(notificationTime?.description)!)
        let notification = UILocalNotification()
        notification.alertBody = "Your work day is done!"
        notification.alertAction = "open"
        notification.fireDate = notificationTime
        notification.soundName = "Default"
        notification.userInfo = ["ID":"ID"]
        notification.category = "reminderNotif"
        UIApplication.shared.scheduleLocalNotification(notification)
    }
    
    func removeWorkNofication(){
        let application = UIApplication.shared
        for notification:AnyObject in application.scheduledLocalNotifications! {
            let scheduledNoti = notification as! UILocalNotification
            if let type = scheduledNoti.category {
                if type == "reminderNotif" {
                    application.cancelLocalNotification(scheduledNoti)
                    NSLog("Canceled notification")
                }
            }
        }
    }
    
    func login(){
        print("Logging in user.")
        let username = UserDefaults.standard.string(forKey: "username")
        let password = UserDefaults.standard.string(forKey: "password")
        print("Username:"+username!+" Password:"+password!)
        Meteor.loginWithUsername(username: username!,password: password!) { result, error in
            print("Got logged in result")
            if error == nil {
                //the log-in was successful and the user is now the active user and credentials saved
                //hide log-in view and show main app content
                print("Log in Success")
                logUser()
            } else {
                //there was an error with the update save
                print("Error logging in")
                print("Error: "+String(describing: error))
                if let reason = error?.reason {
                    print(reason)
                    if(error?.reason! == String("Incorrect password") || String(describing: error?.reason) == "not-authorized"){
                        //if the password is incorrect
                        print("segueing to login")
                        let message = "This is likely the result of you needing to reverify your account."
                        let alert = UIAlertView(
                            title: NSLocalizedString("No verified account found for device.", comment: ""),
                            message: message,
                            delegate: nil,
                            cancelButtonTitle: NSLocalizedString("OK", comment: "OK")
                        )
                        alert.show()
                        self.segueToLogin()
                        return
                    }
                }
            }
        }
    }
    
    func connectToServer(){
        print("connecting to server")
        Meteor.connect(url: "wss://withattendweb-65560.onmodulus.net/websocket") {
            // do something after the client connects
            if(UserDefaults.standard.bool(forKey: "accountCreated")){
                self.downloadData()
                print("Am i logged in = "+String(Meteor.client.loggedIn()))
                //if(Meteor.client.loggedIn() != trLue){
                self.login()
                //}
            }
        }
    }
    
    func updateUI(){
        NSLog("Updating ui")
        var sitename: String = "";
        if(UserDefaults.standard.value(forKey: LAST_FOUND_MAJOR) != nil){
            if(UserDefaults.standard.bool(forKey: SITE_DATA_DOWNLOADED) && lastDiscoveredBeaconMajor != 0){
                NSLog("Loading sites")
                print(lastDiscoveredBeaconMajor)
                let site = getCheckedInJobsite(lastDiscoveredBeaconMajor)
                if(site.verified){ //this line protects the app from crashing when site is nil
                    sitename = site.site["name"] as! String
                }
                else{
                    return
                }
            }
        }
        NSLog("Site name is: "+sitename)
        onsiteImage.image = UIImage(named: "issite")
        //this was added for buildex
        if(lastDiscoveredBeaconMajor == 5){
            print("at buildex")
            onsiteImage.image = UIImage(named: "atbuildex")
        }
        if(UserDefaults.standard.bool(forKey: ONSITE) && UserDefaults.standard.bool(forKey: BLUETOOTH_IS_ACTIVE)){
            //are they in the beacon zone
            NSLog("User is in the beacon zone")
            if(UserDefaults.standard.bool(forKey: CHECKED_IN)){
                //are they at work
                NSLog("User is at work")
                userStatusButtonOutlet.setTitle("Check out", for: UIControlState())
                userStatusButtonOutlet.layer.borderColor = (UIColor( red: 0.7, green: 0, blue:0, alpha: 1.0 )).cgColor
                userStatusButtonOutlet.isEnabled = true
                userStatusButtonOutlet.setTitleColor(hexStringToUIColor("#ff0f05"), for: UIControlState())
                UserDefaults.standard.set(false, forKey: "buttonType")
                if(sitename != ""){
                    beaconRangeLabel.text = "You are checked in at "+sitename+"."
                }else{
                    beaconRangeLabel.text = "You are checked in."
                }
            }
            else{
                //not at work
                NSLog("User is not at work")
                userStatusButtonOutlet.setTitle("Check in", for: UIControlState())
                userStatusButtonOutlet.layer.borderColor = (UIColor( red: 0, green: 0.7, blue:0, alpha: 1.0 )).cgColor
                userStatusButtonOutlet.setTitleColor(hexStringToUIColor("#60CF47"), for: UIControlState())
                userStatusButtonOutlet.isEnabled = true
                UserDefaults.standard.set(true, forKey: "buttonType")
                if(sitename != ""){
                    beaconRangeLabel.text = "You can check in to "+sitename+"."
                }else{
                    beaconRangeLabel.text = "You can check in."
                }
            }
        }
        else{
            //they are not in the beacon zone
            NSLog("User is not in the beacon zone")
            beaconRangeLabel.isHidden = false;
            onsiteImage.image = UIImage(named: "nosite")
            if(lastDiscoveredBeaconMajor == 5){
                onsiteImage.image = UIImage(named: "nobuildex")
            }
            userStatusButtonOutlet.isEnabled = false
            if(UserDefaults.standard.bool(forKey: CHECKED_IN)){
                //at work
                NSLog("User is at work, but could be out of the beacon zone.")
                //userStatusButtonOutlet.enabled = true
                userStatusButtonOutlet.layer.borderColor = (UIColor( red: 0.7, green: 0, blue:0, alpha: 1.0 )).cgColor
                userStatusButtonOutlet.setTitle("Check out", for: UIControlState())
                userStatusButtonOutlet.setTitleColor(hexStringToUIColor("#ff0f05"), for: UIControlState())
                UserDefaults.standard.set(false, forKey: "buttonType")
                if(sitename != ""){
                    beaconRangeLabel.text = "You are checked in on "+sitename+"."
                }else{
                    beaconRangeLabel.text = "You are checked in."
                }
            }
            else{
                NSLog("User is not at work")
                //not at work
                userStatusButtonOutlet.layer.borderColor = (UIColor( red: 0, green: 0.7, blue:0, alpha: 1.0 )).cgColor
                userStatusButtonOutlet.setTitle("Check in", for: UIControlState())
                userStatusButtonOutlet.setTitleColor(hexStringToUIColor("#60CF47"), for: UIControlState())
                UserDefaults.standard.set(false, forKey: "buttonType")
                beaconRangeLabel.text = "You need to be in range of a beacon to check in."
            }
        }
        if(!UserDefaults.standard.bool(forKey: BLUETOOTH_IS_ACTIVE) && debugMode != true){
            beaconRangeLabel.text = "You need to turn on bluetooth so we can detect beacons.";
        }
    }
    
    func downloadData(){
        print("Downloading data")
        let data: [String : AnyObject] = [
            "userId" : USER_ID! as AnyObject
        ]
        Meteor.call(name: "user.getData", params: [data as AnyObject]) { result, error in
            // Do something with the method result
            NSLog("user data call worked")
            if(error == nil){
                //save was successful
                let castResult = result!["sites"] as! NSArray
                let companyid: String = result!["companyId"] as! String
                //let companyName: String = result!["companyName"] as! String
                NSLog(String((result!["sites"]!! as AnyObject).count))
                for i in 0...(result!["sites"]!! as AnyObject).count-1 {
                    UserDefaults.standard.setValue(castResult[i], forKey: SITE_DATA+String(i))
                }
                UserDefaults.standard.set((result!["sites"]!! as AnyObject).count-1, forKey: SITE_INDEX)
                //UserDefaults.standard.setValue(companyName, forKey: COMPANY_NAME)
                UserDefaults.standard.setValue(companyid, forKey: "company_Id");
                UserDefaults.standard.set(true, forKey: SITE_DATA_DOWNLOADED)
            }
            else {
                
            }
        }
    }
    
    func getCheckedInJobsite(_ beaconMajor:Int) -> siteData{
        for i in 0...UserDefaults.standard.integer(forKey: SITE_INDEX) {
            if(UserDefaults.standard.value(forKey: SITE_DATA+String(i)) != nil){
                let site = UserDefaults.standard.value(forKey: SITE_DATA+String(i)) as AnyObject?
                /*print("site")
                print(site)
                print("beacon major")
                print(beaconMajor)*/
                let siteMajor: String  = site!["beaconMajor"] as! String
                /*print("site major")
                print(siteMajor)*/
                if(Int(siteMajor) == beaconMajor){
                    return siteData.init(verified: true, site: site!)
                }
            }
        }
        return siteData.init(verified: false, site: "0" as AnyObject)
    }
    
    func syncOnSiteWithDashboard(){
        let data: [String : AnyObject] = [
            "userId" : USER_ID! as AnyObject
        ]
        print("Syncing app with dashboard")
        Meteor.call(name: "events.isUserOnSite", params: [data as AnyObject]) { result, error in
            // Do something with the method result
            var dashboardUpdate: Bool
            print("Synced app with dashboard")
            if(error == nil){
                let currentStatus: Bool = UserDefaults.standard.bool(forKey: CHECKED_IN)
                //save was successful
                print(result!)
                if(Int(result! as! NSNumber) != 0){
                    //user is on site
                    dashboardUpdate = (result! as? Bool)!
                }
                else{
                    dashboardUpdate = currentStatus
                }
                print(currentStatus)
                print(dashboardUpdate)
                if(dashboardUpdate && dashboardUpdate != currentStatus){
                    UserDefaults.standard.set(true, forKey: CHECKED_IN)
                    self.differenceWithDashboard = true
                    let message = "You have been signed in by your foreman."
                    let alert = UIAlertView(
                        title: NSLocalizedString("You have been signed in.", comment: ""),
                        message: message,
                        delegate: nil,
                        cancelButtonTitle: NSLocalizedString("OK", comment: "OK")
                    )
                    alert.show()
                }
                else if(dashboardUpdate != currentStatus){
                    UserDefaults.standard.set(false, forKey: CHECKED_IN)
                    self.differenceWithDashboard = true
                    let message = "You have been signed out by your foreman."
                    let alert = UIAlertView(
                        title: NSLocalizedString("You have been signed out.", comment: ""),
                        message: message,
                        delegate: nil,
                        cancelButtonTitle: NSLocalizedString("OK", comment: "OK")
                    )
                    alert.show()
                }
                self.updateUI()
            }
            else {
                
            }
        }
        
    }
    
    func loadItems() {
        if let storedItems = UserDefaults.standard.array(forKey: attendViewControllerConstant.storedItemsKey) {
            for itemData in storedItems {
                let item = NSKeyedUnarchiver.unarchiveObject(with: itemData as! Data) as! Item
                items.append(item)
                startMonitoringItem(item)
            }
        }
    }
    
    func beaconRegionWithItem(_ item:Item) -> CLBeaconRegion {
        let beaconRegion = CLBeaconRegion(proximityUUID: item.uuid as UUID, identifier: item.name)
        return beaconRegion
    }
    
    func startMonitoringItem(_ item:Item) {
        NSLog("Monitoring for beacon")
        let beaconRegion = beaconRegionWithItem(item)
        locationManager.startMonitoring(for: beaconRegion)
        locationManager.startRangingBeacons(in: beaconRegion)
    }
    
    func stopMonitoringItem(_ item:Item) {
        let beaconRegion = beaconRegionWithItem(item)
        locationManager.stopMonitoring(for: beaconRegion)
        locationManager.stopRangingBeacons(in: beaconRegion)
    }
    
    func persistItems() {
        var itemsDataArray:[Data] = []
        for item in items {
            let itemData = NSKeyedArchiver.archivedData(withRootObject: item)
            itemsDataArray.append(itemData)
        }
        UserDefaults.standard.set(itemsDataArray, forKey: attendViewControllerConstant.storedItemsKey)
    }
    
    //Elements
    //Label
    @IBOutlet weak var onsiteImage: UIImageView!
    @IBOutlet weak var beaconRangeLabel: UITextView!
    @IBOutlet var jobsiteNameLabel: UILabel!
    //Jobsite Image
    @IBOutlet var jobsiteImage: UIImageView!
    @IBAction func logoutButton(_ sender: AnyObject) {
        Meteor.logout()
    }
    
    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        var statusMessage = ""
        if(debugMode){
            statusMessage = "Bluetooth Status: Turned On"
            if(UserDefaults.standard.bool(forKey: BLUETOOTH_IS_ACTIVE) == false){
                showThankYouBluetoothAlert()
            }
            UserDefaults.standard.set(true, forKey: BLUETOOTH_IS_ACTIVE);
            self.updateUI()
            return;
        }
        switch peripheral.state.rawValue {
        case 5:
            statusMessage = "Bluetooth Status: Turned On"
            if(UserDefaults.standard.bool(forKey: BLUETOOTH_IS_ACTIVE) == false){
                showThankYouBluetoothAlert()
            }
            UserDefaults.standard.set(true, forKey: BLUETOOTH_IS_ACTIVE);
            self.updateUI()
        case 4:
            statusMessage = "Bluetooth Status: Turned Off"
            UserDefaults.standard.set(false, forKey: BLUETOOTH_IS_ACTIVE);
            self.updateUI()
            showBluetoothAlert()
        case 3:
            statusMessage = "Bluetooth Status: Not Authorized"
            UserDefaults.standard.set(false, forKey: BLUETOOTH_IS_ACTIVE);
            self.updateUI()
            showBluetoothAlert()
        default:
            statusMessage = "Bluetooth Status: Unknown"
        }
        
        NSLog(statusMessage)
    }
    func segueToLogin(){
        performSegue(withIdentifier: "seguelogin", sender: nil)
    }
    func foundBeacon(beacons: [CLBeacon]) -> Bool{
        //print(beacons.count)
        var i = 0
        var change = false;
        while(i < beacons.count)
        {
            lastDiscoveredBeaconMinor = Int(beacons[i].minor);
            lastDiscoveredBeaconMajor = Int(beacons[i].major);
            if(getCheckedInJobsite(self.lastDiscoveredBeaconMajor).verified){
                //NSLog("Beacon minor: "+String(describing: beacons[i].minor))
                //NSLog("Beacon major: "+String(describing: beacons[i].major))
                UserDefaults.standard.setValue(lastDiscoveredBeaconMinor, forKey: LAST_FOUND_MINOR)
                UserDefaults.standard.setValue(lastDiscoveredBeaconMajor, forKey: LAST_FOUND_MAJOR)
                //NSLog("Found a beacon")
                if(UserDefaults.standard.bool(forKey: ONSITE) != true)
                {
                    change = true
                    UserDefaults.standard.set(true, forKey: ONSITE);
                }
            }
            
            i += 1
            break;
        }
        //there is at least one close beacon
        return change;
    }
    func initialise(){
        print("Initialising")
        connectToServer()
        Meteor.client.allowSelfSignedSSL = true     // Connect to a server that uses a self signed ssl certificate
        Meteor.client.logLevel = .debug             // Options are: .verbose, .debug, .info, .warning, .error, .severe, .none
        
        //Graphical updates
        UserDefaults.standard.setValue(false, forKey: "_UIConstraintBasedLayoutLogUnsatisfiable")
        self.navigationController?.setNavigationBarHidden(true, animated: true)
        userStatusButtonOutlet.layer.borderWidth = 1
        userStatusButtonOutlet.layer.borderColor = (UIColor( red: 0, green: 0.7, blue:0, alpha: 1.0 )).cgColor
        if(!UserDefaults.standard.bool(forKey: "accountCreated")){
            print("User Not Logged In")
            self.segueToLogin()
            return
        }
        /**
         *Show loading
         **/
        self.view.addSubview(self.progressHUD)
        self.progressHUD.show()
        let options = [CBCentralManagerOptionShowPowerAlertKey:0]
        bluetoothPeripheralManager = CBPeripheralManager(delegate: self, queue: nil, options: options)
        /**
         *Set background images and blur it
         **/
        if !UIAccessibilityIsReduceTransparencyEnabled() {
            self.view.backgroundColor = UIColor(patternImage: UIImage(named: "riverparkplace.png")!)
            let blurEffect = UIBlurEffect(style: UIBlurEffectStyle.light)
            let blurEffectView = UIVisualEffectView(effect: blurEffect)
            //always fill the view
            blurEffectView.frame = self.view.bounds
            blurEffectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            view.insertSubview(blurEffectView, at: 0)
        }
        else {
            self.view.backgroundColor = UIColor.black
        }
        UIApplication.shared.statusBarStyle = UIStatusBarStyle.default
        /**
         *Simulates beacon (mainly for ios simualtor)
         **/
        if(debugMode){
            lastDiscoveredBeaconMinor = Int(2000);
            lastDiscoveredBeaconMajor = Int(5);
            UserDefaults.standard.setValue(lastDiscoveredBeaconMinor, forKey: LAST_FOUND_MINOR)
            UserDefaults.standard.setValue(lastDiscoveredBeaconMajor, forKey: LAST_FOUND_MAJOR)
            NSLog("Found a beacon")
            if(UserDefaults.standard.bool(forKey: ONSITE) != true)
            {
                UserDefaults.standard.set(true, forKey: ONSITE);
            }
            return;
        }
        updateUI()
        self.progressHUD.hide()
        /**
         *Loads real beacon parameters
         **/
        let beacon = Item(name: "Kontakt", uuid: UUID(uuidString:"F7826DA6-4FA2-4E98-8024-BC5B71E0893E")!)
        locationManager.delegate = self
        if (CLLocationManager.authorizationStatus() != CLAuthorizationStatus.authorizedWhenInUse)
        {
            locationManager.requestWhenInUseAuthorization()
        }
        locationManager.startRangingBeacons(in: beaconRegion)
        startMonitoringItem(beacon)
    }
}


extension attendViewController
{
    @objc(locationManager:didRangeBeacons:inRegion:) func locationManager(_ manager: CLLocationManager, didRangeBeacons beacons:[CLBeacon], in region: CLBeaconRegion)
    {
        var change = false
        if(!Meteor.client.loggedIn() && loading != true){
            connectToServer()
        }
        //NSLog("Ranging beacons")
        if (beacons.count >= 1)
        {
            change = foundBeacon(beacons: beacons)
        }
        else
        {
            NSLog("Didnt find a beacon")
            if(UserDefaults.standard.bool(forKey: ONSITE) == true)
            {
                change = true
                UserDefaults.standard.set(false, forKey: ONSITE);
            }
        }
        if(change){
            self.updateUI()
        }
        if(time < Date().timeIntervalSince1970-10){
            time = Date().timeIntervalSince1970
            syncOnSiteWithDashboard()
        }
    }
    func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion)
    {
        let timestamp = DateFormatter.localizedString(from: Date(), dateStyle: .medium, timeStyle: .short)
        if region is CLBeaconRegion
        {
            //user is logged in and will be loaded on first call to Kinvey
            let data: [String : AnyObject] = [
                "time" : timestamp as AnyObject,
                "userId" : USER_ID! as AnyObject,
                "beaconMinor" : String(format:"%f",lastDiscoveredBeaconMinor) as AnyObject,
                "beaconMajor" : String(format:"%f",lastDiscoveredBeaconMajor) as AnyObject,
                "companyId" : COMPANY_ID! as AnyObject,
                "eventType" : 0 as AnyObject
            ]
            Meteor.call(name: "passiveEvents.enterSite", params: [data as AnyObject]) { result, error in
                if error != nil
                {
                    //save failed
                    NSLog("Save failed, with error")
                }
                else
                {
                    //save was successful
                    UserDefaults.standard.set(true, forKey: ONSITE);
                    NSLog("Successfully saved event in background")
                }
            }
        }
    }
    func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion)
    {
        let timestamp = DateFormatter.localizedString(from: Date(), dateStyle: .medium, timeStyle: .short)
        if region is CLBeaconRegion
        {
            let notification = UILocalNotification()
            notification.alertBody = "You are in the beacon zone"
            notification.soundName = "Default"
            notification.userInfo = ["ID":"backgroundNotif"]
            notification.category = "backgroundNotif"
            //user is logged in and will be loaded on first call to Kinvey
            let data: [String : AnyObject] = [
                "time" : timestamp as AnyObject,
                "userId" : USER_ID! as AnyObject,
                "beaconMinor" : String(format:"%f", lastDiscoveredBeaconMinor) as AnyObject,
                "beaconMajor" : String(format:"%f", lastDiscoveredBeaconMajor) as AnyObject,
                "companyId" : COMPANY_ID! as AnyObject,
                "eventType" : 1 as AnyObject
            ]
            Meteor.call(name: "passiveEvents.enterSite", params: [data as AnyObject]) { result, error in
                if error != nil
                {
                    //save failed
                    NSLog("Save failed, with error")
                }
                else
                {
                    //save was successful
                    UserDefaults.standard.set(true, forKey: ONSITE);
                    if(!UserDefaults.standard.bool(forKey: CHECKED_IN)){
                        UIApplication.shared.presentLocalNotificationNow(notification);
                    }
                    NSLog("Successfully saved event in background");
                }
            }
        }
    }
    
}
