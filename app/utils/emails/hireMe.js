

function HireMe() {}

HireMe.prototype.hireMeTemplate = function(params){
  /*
  * Params:
  * @params.profileUser.firstName - the person receiving the email
  * @params.name - the person sending the email
  * @params.email - the email address of the person sending the email
  * @params.message - the message included by the person sending the email
  * */

  var template = '<div>Hello ' + '</div><br><br><div style="line-height: normal;color: #000000;font-size: 14px;font-family: Calibri, sans-serif;">Great news!&nbsp; Someone from the&nbsp;<span style="color: #66B6E0;"><strong>AirVūz</strong></span>&nbsp;community is interested in hiring you for some drone / aerial photography related assignments! &nbsp;</div><div style="line-height: normal;color: #000000;font-size: 14px;font-family: Calibri, sans-serif;">Below, you\'ll find all of the information you\'ll need to contact this person and put your&nbsp;<strong><span style="color: #66B6E0;">AirVūz</span>&nbsp;</strong>connection to work!&nbsp; To ensure a positive experience for everyone, we recommend that you follow up within 24 hours at least to confirm you received their message.&nbsp; After that, you can work out the remaining logistics about the inquiry (and once it’s all said and done, we’d even love it if you shared it back with us on one of your profiles, so we can see the fruits of your labor!)</div>' +
    '<div style="font-size: 12.8px;line-height: normal;color: #000000;font-family: Calibri;"><div style="font-family: Calibri, sans-serif; font-size: 14px;"> <div>The<font color="#66b6e0">&nbsp;</font><span style="color: #66B6E0;"><strong>AirVūz</strong></span><font color="#66b6e0">&nbsp;</font>Team </div> <div>&nbsp;</div> <div>&nbsp;</div> </div> <div style="font-family: Calibri, sans-serif; font-size: 14px;"><span class="im" style="color: #500050;"><font face="arial,sans-serif"><span style="border-collapse:collapse; font-size:13px">The View from Up Here</span></font></span><br><font style="color: #66B6E0;"><strong>AirVuz</strong></font><span style="color: #66B6E0;"><strong>.com</strong>&nbsp;| &nbsp;</span><span style="color: #66B6E0;"><a href="mailto:support@airvuz.com" style="color: #1155CC;" target="_blank">support@airvuz.com</a></span> </div> <div class="yj6qo ajU" style="cursor: pointer; outline: none; padding: 10px 0px; width: 22px;"><div aria-label="Hide expanded content" class="ajR" data-tooltip="Hide expanded content" id=":iw" role="button" style="border: 1px solid #DDDDDD;clear: both;line-height: 6px;outline: none;position: relative;width: 20px;background-color: #F1F1F1;" tabindex="0"><img class="ajT" src="https://ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif" style="height: 8px; opacity: 0.3; width: 20px; background: url(&quot;//ssl.gstatic.com/ui/v1/icons/mail/ellipsis.png&quot;) no-repeat;"> </div></div>' +
    '<div class="adL"><div style="font-family: Calibri, sans-serif; font-size: 14px;">&nbsp;<hr align="center" size="&quot;3&quot;" width="&quot;95%&quot;"> </div><div style="font-family: Calibri, sans-serif; font-size: 14px;"><span class="im" style="color: #500050;">"Hire Me" Inquiry Details:</span> </div><div style="font-family: Calibri, sans-serif; font-size: 14px;">&nbsp;</div></div></div>' +
      '<div>Name: ' + params.name +'</div>' +
      '<div>Email: ' +  params.emailAddress +'</div>' +
      '<div>message: '+params.message+'</div>' +
    '<span class="im" style="color: #500050;">This message may contain confidential and/or restricted information. If you are not the addressee or authorized to receive this for the addressee, you must not use, copy, disclose, or take any action based on this message or any information herein. This information should only be forwarded or distributed on a "need to know basis”. If you have received this message in error, please advise the sender immediately by reply e-mail and delete this message. Thank you for your cooperation.</span>'

  return template;
}

module.exports = new HireMe();