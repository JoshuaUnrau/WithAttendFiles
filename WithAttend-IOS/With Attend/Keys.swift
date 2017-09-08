//
//  Keys.swift
//  WithAttend
//
//  Created by work on 2016-07-05.
//  Copyright © 2016 MayU Studios. All rights reserved.
//

import Foundation
import Fabric
import Crashlytics
import SystemConfiguration
import UIKit

public let COMPANY_NAME = "companyName"
public let COMPANY_ID = "companyId"
public let ONSITE = "onsite"
public let CHECKED_IN = "atWork"
public let SITE_DATA = "sitedata"
public let SITE_INDEX = "siteindex"
public let LAST_FOUND_MAJOR = "lastfoundbeaconmajor"
public let LAST_FOUND_MINOR = "lastfoundbeaconminor"
public let BLUETOOTH_IS_ACTIVE = "bluetoothisactive"
public let USER_ID = "userId"
public let SITE_DATA_DOWNLOADED = "issitedatadownloaded"

//public functions
public func showBluetoothAlert(){
    let message = "Attend needs bluetooth to be on to work. Please turn on bluetooth in settings"
    let alert = UIAlertView(
        title: NSLocalizedString("Your Bluetooth is not on.", comment: ""),
        message: message,
        delegate: nil,
        cancelButtonTitle: NSLocalizedString("OK", comment: "OK")
    )
    alert.show()
}
public func showThankYouBluetoothAlert(){
    let message = ""
    let alert = UIAlertView(
        title: NSLocalizedString("Thank you for turning on bluetooth.", comment: ""),
        message: message,
        delegate: nil,
        cancelButtonTitle: NSLocalizedString("OK", comment: "OK")
    )
    alert.show()
}

public func showUploadFail(){
    let alert = UIAlertView(
    title: NSLocalizedString("Failed to upload.", comment: ""),
    message: "",
    delegate: nil,
    cancelButtonTitle: NSLocalizedString("OK", comment: "OK")
    )
    alert.show()
}


public func hexStringToUIColor (_ hex:String) -> UIColor {
    var cString:String = hex.trimmingCharacters(in:(NSCharacterSet.whitespacesAndNewlines as NSCharacterSet) as CharacterSet).uppercased()
    
    if (cString.hasPrefix("#")) {
        cString = cString.substring(from: cString.characters.index(cString.startIndex, offsetBy: 1))
    }
    
    if ((cString.characters.count) != 6) {
        return UIColor.gray
    }
    
    var rgbValue:UInt32 = 0
    Scanner(string: cString).scanHexInt32(&rgbValue)
    
    return UIColor(
        red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0,
        green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0,
        blue: CGFloat(rgbValue & 0x0000FF) / 255.0,
        alpha: CGFloat(1.0)
    )
}

public func logUser() {
    // TODO: Use the current user's information
    // You can call any combination of these three methods
    Crashlytics.sharedInstance().setUserIdentifier(USER_ID)
    Crashlytics.sharedInstance().setUserName("User")
}
import SystemConfiguration

public class Reachability {
    
    // Check if internet connection is available
    
    class func isConnectedToNetwork() -> Bool {
        
        var status:Bool = false
        
        let url = NSURL(string: "https://google.com")
        let request = NSMutableURLRequest(url: url! as URL)
        request.httpMethod = "HEAD"
        request.cachePolicy = NSURLRequest.CachePolicy.reloadIgnoringLocalAndRemoteCacheData
        request.timeoutInterval = 10.0
        
        var response:URLResponse?
        
        do {
            let _ = try NSURLConnection.sendSynchronousRequest(request as URLRequest, returning: &response) as NSData?
        }
        catch let error as NSError {
            print(error.localizedDescription)
        }
        
        if let httpResponse = response as? HTTPURLResponse {
            if httpResponse.statusCode == 200 {
                status = true
            }
        }
        return status
    }
}

class ProgressHUD: UIVisualEffectView {
    
    var text: String? {
        didSet {
            label.text = text
        }
    }
    let activityIndictor: UIActivityIndicatorView = UIActivityIndicatorView(activityIndicatorStyle: UIActivityIndicatorViewStyle.white)
    let label: UILabel = UILabel()
    let blurEffect = UIBlurEffect(style: .light)
    let vibrancyView: UIVisualEffectView
    
    init(text: String) {
        self.text = text
        self.vibrancyView = UIVisualEffectView(effect: UIVibrancyEffect(blurEffect: blurEffect))
        super.init(effect: blurEffect)
        self.setup()
    }
    
    required init(coder aDecoder: NSCoder) {
        self.text = ""
        self.vibrancyView = UIVisualEffectView(effect: UIVibrancyEffect(blurEffect: blurEffect))
        super.init(coder: aDecoder)!
        self.setup()
        
    }
    
    func setup() {
        contentView.addSubview(vibrancyView)
        vibrancyView.contentView.addSubview(activityIndictor)
        vibrancyView.contentView.addSubview(label)
        activityIndictor.startAnimating()
    }
    
    override func didMoveToSuperview() {
        super.didMoveToSuperview()
        
        if let superview = self.superview {
            
            let width = superview.frame.size.width / 2.3
            let height: CGFloat = 50.0
            self.frame = CGRect(x: superview.frame.size.width / 2 - width / 2, y:
                superview.frame.height / 2 - height / 2, width:width,height:height)
            vibrancyView.frame = self.bounds
            
            let activityIndicatorSize: CGFloat = 40
            activityIndictor.frame = CGRect(x: 5,y: height / 2 - activityIndicatorSize / 2,width:
                activityIndicatorSize,height:activityIndicatorSize)
            
            layer.cornerRadius = 8.0
            layer.masksToBounds = true
            label.text = text
            label.textAlignment = NSTextAlignment.center
            label.frame = CGRect(x: activityIndicatorSize + 5,y: 0,width: width - activityIndicatorSize - 15,height: height)
            label.textColor = UIColor.gray
            label.font = UIFont.boldSystemFont(ofSize: 16)
        }
    }
    
    func show() {
        self.isHidden = false
    }
    
    func hide() {
        self.isHidden = true
    }
}

public func resetKeys(userid: String){
    if(userid != String(describing: UserDefaults.standard.value(forKey: "userId"))){
        UserDefaults.standard.set(nil, forKey: "buttonType")
        UserDefaults.standard.set(nil, forKey: ONSITE);
        UserDefaults.standard.setValue(nil, forKey: LAST_FOUND_MINOR)
        UserDefaults.standard.setValue(nil, forKey: LAST_FOUND_MAJOR)
        for i in 0...UserDefaults.standard.integer(forKey: SITE_INDEX) {
            UserDefaults.standard.setValue(nil, forKey: SITE_DATA+String(i))
        }
        UserDefaults.standard.set(nil, forKey: SITE_INDEX)
    }
    UserDefaults.standard.setValue(nil, forKey: "username");
    UserDefaults.standard.setValue(nil, forKey: "password");
    UserDefaults.standard.setValue(nil, forKey: "userId");
    UserDefaults.standard.setValue(nil, forKey: COMPANY_ID);
    UserDefaults.standard.set(nil, forKey: "accountCreated");
    UserDefaults.standard.set(nil,forKey: "userpin")
    UserDefaults.standard.set(nil, forKey: BLUETOOTH_IS_ACTIVE);
}
