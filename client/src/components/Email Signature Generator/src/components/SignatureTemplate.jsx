import React from "react";

const ASSETS_BASE_URL =
  "https://github.com/MadzNK/nkemailsignature2025/blob/main/";
const DEFAULT_AVATAR = `https://raw.githubusercontent.com/MadzNK/signatureneokred/refs/heads/main/neokred-Dp.png`;
const BADGE_IMG = `https://github.com/MadzNK/signatureneokred/blob/main/Better%20place%20to%20work%202026.png?raw=true`;
const PHONE_IMG = `${ASSETS_BASE_URL}phone.png?raw=true`;
const EMAIL_IMG = `${ASSETS_BASE_URL}email.png?raw=true`;
const LOCATION_IMG = `${ASSETS_BASE_URL}location.png?raw=true`;
const LINKEDIN_IMG = `https://img.icons8.com/ios-filled/50/7f7f7f/linkedin.png`;
const BANNERS = {
  none: "",
  default: `https://raw.githubusercontent.com/MadzNK/signatureneokred/refs/heads/main/neokred-banner.png`,
  christmas: `https://github.com/MadzNK/signatureneokred/blob/main/Banner%20Christmas.png?raw=true`,
  eid: `https://github.com/MadzNK/signatureneokred/blob/main/Edi%20Mubarak%20-%20Banner.png?raw=true`,
};

const getDefaultData = (data) => {
  const emailPrefix = data?.emailPrefix ? data.emailPrefix.trim() : "your.name";
  const email = `${emailPrefix}@neokred.tech`;
  return {
    fullName: data?.fullName || "Your Name",
    designation: data?.designation || "Your Designation",
    companyName: "Neokred Technologies Pvt. Ltd.",
    email: email,
    phone: data?.phone || "+91 0000000000",
    location: data?.location || "Indiqube South Island, Bengaluru",
    selectedBanner: data?.selectedBanner || "default",
    showBanner: data?.showBanner ?? true,
    showPhone: data?.showPhone ?? true,
    showLinkedin: data?.showLinkedin ?? true,
    linkedinUrl: data?.linkedinUrl || "https://linkedin.com/company/neokred",
    linkedinMessage: data?.linkedinMessage || "Let's connect on LinkedIn",
    profilePhoto: data?.profilePhoto || DEFAULT_AVATAR,
  };
};

export const generateSignatureHTML = (data) => {
  const {
    fullName,
    designation,
    companyName,
    email,
    phone,
    location,
    linkedinUrl,
    linkedinMessage,
    selectedBanner,
    showBanner,
    showPhone,
    showLinkedin,
    profilePhoto,
  } = getDefaultData(data);

  return `
<table cellpadding="0" cellspacing="0" role="presentation" width="379.40" style="width: 379.4px; border-spacing: 0; font-family: Inter, Tahoma, sans-serif; min-width: 379.4px; color-scheme: light dark; supported-color-schemes: light dark;">
  <tr>
    <td style="padding-bottom: 8px">
      <table cellpadding="0" cellspacing="0" role="presentation" style="border-spacing: 0">
        <tr>
          <td style="padding-right: 11px">
            <img src="${profilePhoto}" width="84" alt="Profile Picture" style="border: none; border-radius: 40px; max-width: initial; object-fit: contain; width: 84px; display: block;" />
          </td>
          <td width="225.4" style="padding-left: 8px; width: 225.4px">
            <table cellpadding="0" cellspacing="0" role="presentation" width="100.00%" style="width: 100%; border-spacing: 0">
              <tr>
                <td valign="top" height="21" style="height: 21px; vertical-align: top">
                  <p class="color-de5b11" width="100.00%" style="font-size: 16px; font-weight: 600; color: #de5b11; margin: 0; padding: 0; width: 100%; line-height: 19px; mso-line-height-rule: exactly;">
                    ${fullName}
                  </p>
                </td>
              </tr>
              <tr>
                <td valign="top" height="19" style="padding-top: 2px; height: 19px; vertical-align: top;">
                  <p class="color-7f7f7f" width="100.00%" style="font-size: 14px; font-weight: 500; font-style: italic; color: #7f7f7f; margin: 0; padding: 0; width: 100%; line-height: 17px; mso-line-height-rule: exactly;">
                    ${designation}
                  </p>
                </td>
              </tr>
              <tr>
                <td valign="top" height="19" style="padding-top: 8px; height: 19px; vertical-align: top;">
                  <p class="color-7f7f7f" width="100.00%" style="font-size: 14px; font-weight: 500; color: #7f7f7f; margin: 0; padding: 0; width: 100%; line-height: 17px; mso-line-height-rule: exactly;">
                    ${companyName}
                  </p>
                </td>
              </tr>
            </table>
          </td>
          <td>
            <img src="${BADGE_IMG}" width="51" alt="Great Place to work" style="border: none; max-width: initial; object-fit: contain; width: 51px; display: block;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${
    showPhone
      ? `
  <tr>
    <td style="padding-top: 6px; padding-bottom: 6px">
      <table cellpadding="0" cellspacing="0" role="presentation" style="border-spacing: 0">
        <tr>
          <td>
            <img src="${PHONE_IMG}" width="16.00" alt="phone icon" height="16.00" style="width: 16px; height: 16px; display: block" />
          </td>
          <td width="356.4" style="padding-left: 7px; width: 356.4px">
            <p class="color-7f7f7f" width="100.00%" style="font-size: 14px; font-weight: 500; color: #7f7f7f; margin: 0; padding: 0; width: 100%; line-height: 17px; mso-line-height-rule: exactly;">
              ${phone}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  `
      : ""
  }
  <tr>
    <td style="padding-top: 6px; padding-bottom: 6px">
      <table cellpadding="0" cellspacing="0" role="presentation" style="border-spacing: 0">
        <tr>
          <td>
            <img src="${EMAIL_IMG}" width="16.00" alt="email icon" height="16.00" style="width: 16px; height: 16px; display: block" />
          </td>
          <td width="356.4" style="padding-left: 7px; width: 356.4px">
            <p class="color-7f7f7f" width="356.4" style="font-size: 14px; font-weight: 500; color: #7f7f7f; margin: 0; padding: 0; width: 356.4px; line-height: 17px; mso-line-height-rule: exactly;">
              ${email}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-top: 6px; padding-bottom: 6px">
      <table cellpadding="0" cellspacing="0" role="presentation" style="border-spacing: 0">
        <tr>
          <td>
            <img src="${LOCATION_IMG}" width="16.00" alt="location icon" height="16.00" style="width: 16px; height: 16px; display: block" />
          </td>
          <td width="356.4" style="padding-left: 7px; width: 356.4px">
            <p class="color-7f7f7f" width="100.00%" style="font-size: 14px; font-weight: 500; color: #7f7f7f; margin: 0; padding: 0; width: 100%; line-height: 17px; mso-line-height-rule: exactly;">
              ${location}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${
    showLinkedin && linkedinUrl
      ? `
  <tr>
    <td style="padding-top: 6px; padding-bottom: 6px">
      <table cellpadding="0" cellspacing="0" role="presentation" style="border-spacing: 0">
        <tr>
          <td>
            <img src="${LINKEDIN_IMG}" width="16.00" alt="linkedin icon" height="16.00" style="width: 16px; height: 16px; display: block" />
          </td>
          <td width="356.4" style="padding-left: 7px; width: 356.4px">
            <a href="${linkedinUrl}" target="_blank" class="color-7f7f7f" width="100.00%" style="font-size: 14px; font-weight: 500; color: #7f7f7f; margin: 0; padding: 0; width: 100%; line-height: 17px; mso-line-height-rule: exactly; text-decoration: none;">${linkedinMessage}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  `
      : ""
  }
  ${
    showBanner && selectedBanner !== "none" && BANNERS[selectedBanner]
      ? `
  <tr>
    <td style="padding-top: 8px; padding-bottom: 8px">
      <a href="https://neokred.tech/" target="_blank">
        <img src="${BANNERS[selectedBanner]}" width="380" alt="Neokred Banner" style="max-width: initial; width: 380px; display: block" />
      </a>
    </td>
  </tr>
  `
      : ""
  }
  <tr>
    <td style="padding-top: 5px">
      <p width="100.00%" style="font-size: 8px; font-weight: 400; text-align: left; color: #7f7f7f; margin: 0; padding: 0; width: 100%;">
        This email is confidential and for the intended recipient only. Do
        not share without the sender's consent. If received in error,
        please reply and delete it.
      </p>
    </td>
  </tr>
</table>
`.trim();
};

export const SignaturePreview = ({ data }) => {
  const {
    fullName,
    designation,
    companyName,
    email,
    phone,
    location,
    linkedinUrl,
    linkedinMessage,
    selectedBanner,
    showBanner,
    showPhone,
    showLinkedin,
    profilePhoto,
  } = getDefaultData(data);

  return (
    <table
      cellPadding="0"
      cellSpacing="0"
      role="presentation"
      width="379.40"
      style={{
        width: "379.4px",
        borderSpacing: 0,
        fontFamily: "Inter, Tahoma, sans-serif",
        minWidth: "379.4px",
        colorScheme: "light dark",
      }}
    >
      <tbody>
        <tr>
          <td style={{ paddingBottom: "8px" }}>
            <table
              cellPadding="0"
              cellSpacing="0"
              role="presentation"
              style={{ borderSpacing: 0 }}
            >
              <tbody>
                <tr>
                  <td style={{ paddingRight: "11px" }}>
                    <img
                      src={profilePhoto}
                      width="84"
                      alt="Profile Picture"
                      style={{
                        border: "none",
                        borderRadius: "40px",
                        maxWidth: "initial",
                        objectFit: "contain",
                        width: "84px",
                        display: "block",
                      }}
                    />
                  </td>
                  <td
                    width="225.4"
                    style={{ paddingLeft: "8px", width: "225.4px" }}
                  >
                    <table
                      cellPadding="0"
                      cellSpacing="0"
                      role="presentation"
                      width="100%"
                      style={{ width: "100%", borderSpacing: 0 }}
                    >
                      <tbody>
                        <tr>
                          <td
                            valign="top"
                            height="21"
                            style={{ height: "21px", verticalAlign: "top" }}
                          >
                            <p
                              className="color-de5b11"
                              style={{
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "#de5b11",
                                margin: 0,
                                padding: 0,
                                width: "100%",
                                lineHeight: "19px",
                                msoLineHeightRule: "exactly",
                              }}
                            >
                              {fullName}
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td
                            valign="top"
                            height="19"
                            style={{
                              paddingTop: "2px",
                              height: "19px",
                              verticalAlign: "top",
                            }}
                          >
                            <p
                              className="color-7f7f7f"
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                fontStyle: "italic",
                                color: "#7f7f7f",
                                margin: 0,
                                padding: 0,
                                width: "100%",
                                lineHeight: "17px",
                                msoLineHeightRule: "exactly",
                              }}
                            >
                              {designation}
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td
                            valign="top"
                            height="19"
                            style={{
                              paddingTop: "8px",
                              height: "19px",
                              verticalAlign: "top",
                            }}
                          >
                            <p
                              className="color-7f7f7f"
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#7f7f7f",
                                margin: 0,
                                padding: 0,
                                width: "100%",
                                lineHeight: "17px",
                                msoLineHeightRule: "exactly",
                              }}
                            >
                              {companyName}
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td>
                    <img
                      src={BADGE_IMG}
                      width="51"
                      alt="Great Place to work"
                      style={{
                        border: "none",
                        maxWidth: "initial",
                        objectFit: "contain",
                        width: "51px",
                        display: "block",
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        {showPhone && (
          <tr>
            <td style={{ paddingTop: "6px", paddingBottom: "6px" }}>
              <table
                cellPadding="0"
                cellSpacing="0"
                role="presentation"
                style={{ borderSpacing: 0 }}
              >
                <tbody>
                  <tr>
                    <td>
                      <img
                        src={PHONE_IMG}
                        width="16"
                        alt="phone icon"
                        height="16"
                        style={{
                          width: "16px",
                          height: "16px",
                          display: "block",
                        }}
                      />
                    </td>
                    <td
                      width="356.4"
                      style={{ paddingLeft: "7px", width: "356.4px" }}
                    >
                      <p
                        className="color-7f7f7f"
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#7f7f7f",
                          margin: 0,
                          padding: 0,
                          width: "100%",
                          lineHeight: "17px",
                          msoLineHeightRule: "exactly",
                        }}
                      >
                        {phone}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        )}
        <tr>
          <td style={{ paddingTop: "6px", paddingBottom: "6px" }}>
            <table
              cellPadding="0"
              cellSpacing="0"
              role="presentation"
              style={{ borderSpacing: 0 }}
            >
              <tbody>
                <tr>
                  <td>
                    <img
                      src={EMAIL_IMG}
                      width="16"
                      alt="email icon"
                      height="16"
                      style={{
                        width: "16px",
                        height: "16px",
                        display: "block",
                      }}
                    />
                  </td>
                  <td
                    width="356.4"
                    style={{ paddingLeft: "7px", width: "356.4px" }}
                  >
                    <p
                      className="color-7f7f7f"
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#7f7f7f",
                        margin: 0,
                        padding: 0,
                        width: "356.4px",
                        lineHeight: "17px",
                        msoLineHeightRule: "exactly",
                      }}
                    >
                      {email}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td style={{ paddingTop: "6px", paddingBottom: "6px" }}>
            <table
              cellPadding="0"
              cellSpacing="0"
              role="presentation"
              style={{ borderSpacing: 0 }}
            >
              <tbody>
                <tr>
                  <td>
                    <img
                      src={LOCATION_IMG}
                      width="16"
                      alt="location icon"
                      height="16"
                      style={{
                        width: "16px",
                        height: "16px",
                        display: "block",
                      }}
                    />
                  </td>
                  <td
                    width="356.4"
                    style={{ paddingLeft: "7px", width: "356.4px" }}
                  >
                    <p
                      className="color-7f7f7f"
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#7f7f7f",
                        margin: 0,
                        padding: 0,
                        width: "100%",
                        lineHeight: "17px",
                        msoLineHeightRule: "exactly",
                      }}
                    >
                      {location}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        {showLinkedin && linkedinUrl && (
          <tr>
            <td style={{ paddingTop: "6px", paddingBottom: "6px" }}>
              <table
                cellPadding="0"
                cellSpacing="0"
                role="presentation"
                style={{ borderSpacing: 0 }}
              >
                <tbody>
                  <tr>
                    <td>
                      <img
                        src={LINKEDIN_IMG}
                        width="16"
                        alt="linkedin icon"
                        height="16"
                        style={{
                          width: "16px",
                          height: "16px",
                          display: "block",
                        }}
                      />
                    </td>
                    <td
                      width="356.4"
                      style={{ paddingLeft: "7px", width: "356.4px" }}
                    >
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="color-7f7f7f"
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#7f7f7f",
                          margin: 0,
                          padding: 0,
                          width: "100%",
                          lineHeight: "17px",
                          msoLineHeightRule: "exactly",
                          textDecoration: "none",
                        }}
                      >
                        {linkedinMessage}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        )}
        {showBanner && selectedBanner !== "none" && BANNERS[selectedBanner] && (
          <tr>
            <td style={{ paddingTop: "8px", paddingBottom: "8px" }}>
              <a href="https://neokred.tech/" target="_blank" rel="noreferrer">
                <img
                  src={BANNERS[selectedBanner]}
                  width="380"
                  alt="Neokred Banner"
                  style={{
                    maxWidth: "initial",
                    width: "380px",
                    display: "block",
                  }}
                />
              </a>
            </td>
          </tr>
        )}
        <tr>
          <td style={{ paddingTop: "5px" }}>
            <p
              style={{
                fontSize: "8px",
                fontWeight: 400,
                textAlign: "left",
                color: "#7f7f7f",
                margin: 0,
                padding: 0,
                width: "100%",
              }}
            >
              This email is confidential and for the intended recipient only. Do
              not share without the sender's consent. If received in error,
              please reply and delete it.
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  );
};
