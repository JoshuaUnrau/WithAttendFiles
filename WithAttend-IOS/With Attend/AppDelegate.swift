import UIKit
import UserNotifications
import CoreLocation
import SwiftDDP
import Fabric
import Crashlytics

import Firebase
import FirebaseInstanceID
import FirebaseMessaging

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var loadedEnoughToDeepLink : Bool = false
    var deepLink : RemoteNotificationDeepLink?
    let locationManager = CLLocationManager()
    var company_id = UserDefaults.standard.value(forKey: COMPANY_ID)
    var user_id = UserDefaults.standard.value(forKey: USER_ID)
    var window: UIWindow?
    
    func application(application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?, open url: URL, sourceApplication: String?, annotation: Any) -> Bool {
        if url.host == nil
        {
            return true;
        }
        
        let urlString = url.absoluteString
        NSLog(urlString)
        let queryArray = urlString.components(separatedBy: "pin:")
        let query = queryArray[1]
        UserDefaults.standard.set(Int(query)!,forKey: "userpin")
        if(!UserDefaults.standard.bool(forKey: "accountCreated")){
            let mainStoryboard = UIStoryboard(name: "Main", bundle: nil)
            // rootViewController
            let rootViewController = mainStoryboard.instantiateViewController(withIdentifier: "setUpController") as UIViewController
            // navigationController
            let navigationController = UINavigationController(rootViewController: rootViewController)
            // self.window
            self.window = UIWindow(frame: UIScreen.main.bounds)
            self.window!.rootViewController = navigationController
            self.window!.makeKeyAndVisible()
        
        }
            return true
    }
    
    func applicationHandleRemoteNotification(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any])
    {
        print("Handling remote notifications")
        if application.applicationState == UIApplicationState.background || application.applicationState == UIApplicationState.inactive
        {
            self.deepLink = RemoteNotificationDeepLink.create(userInfo)
            self.triggerDeepLinkIfPresent()
        }
    }
    // [START receive_message]
    private func application(application: UIApplication,didReceiveRemoteNotification userInfo: [NSObject : AnyObject],fetchCompletionHandler completionHandler: (UIBackgroundFetchResult) -> Void) {
        // If you are receiving a notification message while your app is in the background,
        // this callback will not be fired till the user taps on the notification launching the application.
        // TODO: Handle data of notification
        
        // Print message ID.
        print("Printing notification")
        //print("Message ID: \(userInfo["gcm.message_id"]!)")
        print(userInfo)
        //let data = userInfo["data"]!
        /*print(data)
        print(data["goto"])
        if(String(describing: data["goto"] as! NSDictionary) != "" && data["goto"] != nil){
            UIApplication.shared.openURL(URL(string: "http://www."+String(describing: data["goto"] as! NSDictionary))! as URL)
        }*/
        // Print full message.
        print("%@", userInfo)
    }
    // [END receive_message]
    
    // [START refresh_token]
    func tokenRefreshNotification(notification: NSNotification) {
        if let refreshedToken = FIRInstanceID.instanceID().token() {
            print("InstanceID token: \(refreshedToken)")
        }
        connectToFcm()
    }
    
    func connectToFcm() {
        FIRMessaging.messaging().connect { (error) in
            if (error != nil) {
                print("Unable to connect with FCM. \(error)")
            } else {
                print("Connected to FCM.")
            }
        }
    }
    
    func applicationDidBecomeActive(_ application: UIApplication) {
        connectToFcm()
    }
    
    // [START disconnect_from_fcm]
    func applicationDidEnterBackground(_ application: UIApplication) {
        connectToFcm()
        FIRMessaging.messaging().disconnect()
        print("Disconnected from FCM.")
    }
    // [END disconnect_from_fcm]
    // [END connect_to_fcm]
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
        Crashlytics().debugMode = true
        Fabric.with([Crashlytics.self()])
        UIApplication.shared.setStatusBarStyle(UIStatusBarStyle.lightContent, animated: true)
        connectToFcm()
        if #available(iOS 10.0, *) {
            let authOptions : UNAuthorizationOptions = [.alert, .badge, .sound]
            UNUserNotificationCenter.current().requestAuthorization(
                options: authOptions,
                completionHandler: {_,_ in })
            
            // For iOS 10 display notification (sent via APNS)
            UNUserNotificationCenter.current().delegate = self
            // For iOS 10 data message (sent via FCM)
            FIRMessaging.messaging().remoteMessageDelegate = self
            
        } else {
            let settings: UIUserNotificationSettings = UIUserNotificationSettings(types: [.badge, .sound, .alert], categories: nil)
            application.registerUserNotificationSettings(settings)
        }
        
        application.registerForRemoteNotifications()
        
        // [END register_for_notifications]
        
        FIRApp.configure()
        
        // Add observer for InstanceID token refresh callback.
        NotificationCenter.default.addObserver(self, selector: #selector(self.tokenRefreshNotification), name: NSNotification.Name.firInstanceIDTokenRefresh,object: nil)
        return true
    }
    
    func application(_ application: UIApplication,didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        FIRInstanceID.instanceID().setAPNSToken(deviceToken as Data, type: FIRInstanceIDAPNSTokenType.sandbox)
    }
    
    func logUser() {
        // TODO: Use the current user's information
        // You can call any combination of these three methods
        //Crashlytics.sharedInstance().setUserEmail("user@fabric.io")
        Crashlytics.sharedInstance().setUserIdentifier("12345")
        Crashlytics.sharedInstance().setUserName("Test User")
    }
    
    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
        //UserDefaults.standard.synchronize()
    }
    
    
    func triggerDeepLinkIfPresent() -> Bool
    {
        self.loadedEnoughToDeepLink = true
        let ret = (self.deepLink?.trigger() != nil)
        self.deepLink = nil
        return ret
    }
    
    func applicationWillEnterForeground(_ application: UIApplication) {
        Meteor.connect(url: "wss://withattendweb-65560.onmodulus.net/websocket") {
            print("connected in app delegate")
            let username = UserDefaults.standard.string(forKey: "username")
            let password = UserDefaults.standard.string(forKey: "password")
            if(username == "" || username == nil || password == "" || password == nil){
                return;
            }
            print("Username:"+username!+" Password:"+password!)
            Meteor.loginWithUsername(username: username!,password: password!) { result, error in
                if error == nil {
                    //the log-in was successful and the user is now the active user and credentials saved
                    //hide log-in view and show main app content
                    print("Log in Success")
                } else {
                    //there was an error with the update save
                    print("Error logging in: App delegate")
                    if(String(describing: error?.reason) == String("Optional(\"Incorrect password\")") || String(describing: error?.reason) == "not-authorized"){
                        //if there is not a user found
                        return
                    }
                }
            }
        }
    }
}

// [START ios_10_message_handling]
@available(iOS 10, *)
extension AppDelegate : UNUserNotificationCenterDelegate {
    
    // Receive displayed notifications for iOS 10 devices.
    private func userNotificationCenter(center: UNUserNotificationCenter,
                                willPresentNotification notification: UNNotification,
                                withCompletionHandler completionHandler: (UNNotificationPresentationOptions) -> Void) {
        print("Recieved message")
        let userInfo = notification.request.content.userInfo
        // Print message ID.
        print("Message ID: \(userInfo["gcm.message_id"]!)")
        
        // Print full message.
        print("%@", userInfo)
    }
}

extension AppDelegate : FIRMessagingDelegate {
    // Receive data message on iOS 10 devices.
    func applicationReceivedRemoteMessage(_ remoteMessage: FIRMessagingRemoteMessage) {
        print("Recieved data message")
        print("%@", remoteMessage.appData)
    }
}

extension AppDelegate: CLLocationManagerDelegate
{
    func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion)
    {
        if(Meteor.client.loggedIn()){
        if region is CLBeaconRegion
        {
            let timestamp = DateFormatter.localizedString(from: Date(), dateStyle: .medium, timeStyle: .short)
            /*
            let notification = UILocalNotification()
            notification.alertBody = "You are not in the beacon zone"
            notification.soundName = "Default"
            notification.userInfo = ["ID":"backgroundNotif"]
            notification.category = "backgroundNotif"
             */
            //user is logged in and will be loaded on first call to Kinvey
            let data: [String : AnyObject] = [
                "time" : timestamp as AnyObject,
                "userId" : user_id! as AnyObject,
                "beaconMinor" : UserDefaults.standard.value(forKey: LAST_FOUND_MINOR)! as AnyObject,
                "beaconMajor" : UserDefaults.standard.value(forKey: LAST_FOUND_MAJOR)! as AnyObject,
                "companyId" : company_id! as AnyObject,
                "eventType" : 1 as AnyObject
            ]
            Meteor.call(name: "passiveEvents.leaveSite", params: [data as AnyObject]) { result, error in
                if error != nil
                {
                    //save failed
                    NSLog("Save failed, with error")
                }
                else
                {
                    //save was successful
                    UserDefaults.standard.set(true, forKey: ONSITE);
                    //UIApplication.sharedApplication().presentLocalNotificationNow(notification)
                    NSLog("Successfully saved event in background")
                }
            }
        }
        }
    }
    func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion)
    {
        if(Meteor.client.loggedIn()){
        if region is CLBeaconRegion
        {
            let timestamp = DateFormatter.localizedString(from: Date(), dateStyle: .medium, timeStyle: .short)
            let notification = UILocalNotification()
            notification.alertBody = "You are in the beacon zone"
            notification.soundName = "Default"
            notification.userInfo = ["ID":"backgroundNotif"]
            notification.category = "backgroundNotif"
            //user is logged in and will be loaded on first call to Kinvey
            let data: [String : AnyObject] = [
                "time" : timestamp as AnyObject, //not yet used
                "userId" : user_id! as AnyObject,
                "beaconMinor" : UserDefaults.standard.value(forKey: LAST_FOUND_MINOR)! as AnyObject,
                "beaconMajor" : UserDefaults.standard.value(forKey: LAST_FOUND_MAJOR)! as AnyObject,
                "companyId" : company_id! as AnyObject,
                "eventType" : 1 as AnyObject //not yet used
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
                        UIApplication.shared.presentLocalNotificationNow(notification)
                    }
                    NSLog("Successfully saved event in background")
                }
            }
        }
        }
    }
    
    func colorWithHexString (_ hex:String) -> UIColor {
        var cString:String = hex.trimmingCharacters(in:NSCharacterSet.whitespacesAndNewlines).uppercased()
        
        if (cString.hasPrefix("#")) {
            cString = (cString as NSString).substring(from: 1)
        }
        
        if (cString.characters.count != 6) {
            return UIColor.gray
        }
        
        let rString = (cString as NSString).substring(to: 2)
        let gString = ((cString as NSString).substring(from: 2) as NSString).substring(to: 2)
        let bString = ((cString as NSString).substring(from: 4) as NSString).substring(to: 2)
        
        var r:CUnsignedInt = 0, g:CUnsignedInt = 0, b:CUnsignedInt = 0;
        Scanner(string: rString).scanHexInt32(&r)
        Scanner(string: gString).scanHexInt32(&g)
        Scanner(string: bString).scanHexInt32(&b)
        
        
        return UIColor(red: CGFloat(r) / 255.0, green: CGFloat(g) / 255.0, blue: CGFloat(b) / 255.0, alpha: CGFloat(1))
    }
    
}
