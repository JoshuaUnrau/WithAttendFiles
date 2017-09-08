//
//  RemoteNotificationDeepLink.swift
//  DeepLink
//
//  Created by Brian Coleman on 2015-07-12.
//  Copyright (c) 2015 Brian Coleman. All rights reserved.
//

import UIKit

let RemoteNotificationDeepLinkAppSectionKey : String = "article"

class RemoteNotificationDeepLink: NSObject {
   
    var article : String = ""
    
    class func create(_ userInfo : [AnyHashable: Any]) -> RemoteNotificationDeepLink?
    {
        let info = userInfo as NSDictionary
        
        let articleID = info.object(forKey: RemoteNotificationDeepLinkAppSectionKey) as! String
        
        var ret : RemoteNotificationDeepLink? = nil
        if !articleID.isEmpty
        {
            ret = RemoteNotificationDeepLinkArticle(articleStr: articleID)
        }
        return ret
    }
    
    fileprivate override init()
    {
        self.article = ""
        super.init()
    }
    
    fileprivate init(articleStr: String)
    {
        self.article = articleStr
        super.init()
    }
    
    final func trigger()
    {
        DispatchQueue.main.async
            {
                //NSLog("Triggering Deep Link - %@", self)
                self.triggerImp()
                    { (passedData) in
                        // do nothing
                }
        }
    }
    
    fileprivate func triggerImp(_ completion: ((AnyObject?)->(Void)))
    {
        
        completion(nil)
    }
}

class RemoteNotificationDeepLinkArticle : RemoteNotificationDeepLink
{
    var articleID : String!
    
    override init(articleStr: String)
    {
        self.articleID = articleStr
        super.init(articleStr: articleStr)
    }
    
    fileprivate override func triggerImp(_ completion: ((AnyObject?)->(Void)))
    {
    }
    
}
