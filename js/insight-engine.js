// =========================================================
// EDXCEL AI INSIGHT ENGINE
// =========================================================


// =========================================================
// API CONFIGURATION
// =========================================================

const API_BASE_URL = "http://127.0.0.1:8000";


// =========================================================
// ELEMENTS
// =========================================================

const receiptFile =
    document.getElementById("receiptFile");

const analyseReceiptButton =
    document.getElementById(
        "analyseReceiptButton"
    );

const receiptStatus =
    document.getElementById(
        "receiptStatus"
    );

const receiptResults =
    document.getElementById(
        "receiptResults"
    );


// =========================================================
// BUTTON EVENT
// =========================================================

if (analyseReceiptButton) {

    analyseReceiptButton.addEventListener(
        "click",
        analyseReceipt
    );

}


// =========================================================
// ANALYSE RECEIPT
// =========================================================

async function analyseReceipt() {

    // -----------------------------------------------------
    // Check file
    // -----------------------------------------------------

    if (!receiptFile.files.length) {

        showStatus(
            "Please select a receipt image first.",
            "error"
        );

        return;
    }


    const file =
        receiptFile.files[0];


    // -----------------------------------------------------
    // Check file type
    // -----------------------------------------------------

    const allowedTypes = [
        "image/jpeg",
        "image/png"
    ];


    if (!allowedTypes.includes(file.type)) {

        showStatus(
            "Please upload a JPG, JPEG or PNG image.",
            "error"
        );

        return;
    }


    // -----------------------------------------------------
    // Prepare FormData
    // -----------------------------------------------------

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );


    // -----------------------------------------------------
    // Loading state
    // -----------------------------------------------------

    analyseReceiptButton.disabled = true;

    analyseReceiptButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Analysing...';


    showStatus(
        "Uploading receipt and analysing...",
        "loading"
    );


    receiptResults.style.display =
        "none";


    try {

        // -------------------------------------------------
        // Call FastAPI
        // -------------------------------------------------

        const response =
            await fetch(
                `${API_BASE_URL}/receipt`,
                {
                    method: "POST",
                    body: formData
                }
            );


        // -------------------------------------------------
        // Read response
        // -------------------------------------------------

        const data =
            await response.json();


        // -------------------------------------------------
        // Handle API error
        // -------------------------------------------------

        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Receipt analysis failed."
            );
        }


        // -------------------------------------------------
        // Display receipt
        // -------------------------------------------------

        displayReceipt(
            data
        );


        showStatus(
            "Receipt analysed successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Receipt analysis error:",
            error
        );


        showStatus(
            getFriendlyErrorMessage(
                error
            ),
            "error"
        );


    } finally {

        analyseReceiptButton.disabled =
            false;

        analyseReceiptButton.innerHTML =
            '<i class="fas fa-magnifying-glass"></i> Analyse Receipt';

    }

}


// =========================================================
// DISPLAY RECEIPT
// =========================================================

function displayReceipt(data) {

    const receipt =
        data.receipt_data;


    if (!receipt) {

        throw new Error(
            "No receipt data was returned."
        );
    }


    // -----------------------------------------------------
    // Summary
    // -----------------------------------------------------

    document.getElementById(
        "storeName"
    ).textContent =
        safeValue(
            receipt.store_name
        );


    document.getElementById(
        "receiptDate"
    ).textContent =
        safeValue(
            receipt.date
        );


    document.getElementById(
        "paymentMethod"
    ).textContent =
        safeValue(
            receipt.payment_method
        );


    document.getElementById(
        "grandTotal"
    ).textContent =
        formatMoney(
            receipt.grand_total,
            receipt.currency
        );


    // -----------------------------------------------------
    // Items
    // -----------------------------------------------------

    const itemsContainer =
        document.getElementById(
            "receiptItems"
        );


    itemsContainer.innerHTML =
        "";


    const items =
        receipt.items || [];


    if (!items.length) {

        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `
            <td colspan="4">
                No identifiable items were found.
            </td>
        `;


        itemsContainer.appendChild(
            row
        );

    } else {

        items.forEach(
            item => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            safeValue(item.item)
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            safeValue(item.quantity)
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            item.unit_price,
                            receipt.currency
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            item.line_total,
                            receipt.currency
                        )}
                    </td>

                `;


                itemsContainer.appendChild(
                    row
                );

            }
        );

    }


    // -----------------------------------------------------
    // Totals
    // -----------------------------------------------------

    document.getElementById(
        "receiptSubtotal"
    ).textContent =
        formatMoney(
            receipt.subtotal,
            receipt.currency
        );


    document.getElementById(
        "receiptTax"
    ).textContent =
        formatMoney(
            receipt.tax,
            receipt.currency
        );


    document.getElementById(
        "receiptDiscount"
    ).textContent =
        formatMoney(
            receipt.discount,
            receipt.currency
        );


    document.getElementById(
        "receiptGrandTotal"
    ).textContent =
        formatMoney(
            receipt.grand_total,
            receipt.currency
        );


    // -----------------------------------------------------
    // Receipt ID
    // -----------------------------------------------------

    document.getElementById(
        "receiptId"
    ).textContent =
        `Receipt ID: ${safeValue(
            data.receipt_id
        )}`;


    // -----------------------------------------------------
    // Show results
    // -----------------------------------------------------

    receiptResults.style.display =
        "block";

}


// =========================================================
// FORMAT MONEY
// =========================================================

function formatMoney(
    value,
    currency
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "-";
    }


    const currencyCode =
        currency || "ZAR";


    const numericValue =
        Number(value);


    if (Number.isNaN(
        numericValue
    )) {

        return `${currencyCode} ${value}`;
    }


    return new Intl.NumberFormat(
        "en-ZA",
        {
            style: "currency",
            currency: currencyCode
        }
    ).format(
        numericValue
    );

}


// =========================================================
// SAFE VALUE
// =========================================================

function safeValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "-";
    }


    return String(
        value
    );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =========================================================
// STATUS MESSAGE
// =========================================================

function showStatus(
    message,
    type
) {

    receiptStatus.textContent =
        message;


    receiptStatus.className =
        `receipt-status ${type}`;

}


// =========================================================
// FRIENDLY ERROR
// =========================================================

function getFriendlyErrorMessage(
    error
) {

    if (
        error.message &&
        error.message.includes(
            "Failed to fetch"
        )
    ) {

        return (
            "Could not connect to the EdXcel AI "
            + "Insight Engine. Make sure your "
            + "FastAPI server is running."
        );

    }


    return (
        error.message ||
        "Something went wrong while analysing the receipt."
    );

}
