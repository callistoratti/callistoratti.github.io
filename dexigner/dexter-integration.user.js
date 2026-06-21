// ==UserScript==
// @name         Dexter Dexigner Sipariş Entegrasyonu
// @namespace    http://dexterdesigner.com/
// @version      1.0.0
// @description  Shopify ve Shopier siparişlerinizi tek tıkla kopyalayıp Dexter Dexigner formatına dönüştürür.
// @author       Dexter Dexigner
// @match        https://admin.shopify.com/*
// @match        https://*.myshopify.com/admin/*
// @match        https://www.shopier.com/Showroom/*
// @grant        GM_setClipboard
// @grant        GM_notification
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Toast Notification helper
    function showToast(message) {
        if (typeof GM_notification === 'function') {
            GM_notification({
                text: message,
                title: "Dexter Dexigner",
                timeout: 3000
            });
        } else {
            alert(message);
        }
    }

    // Helper to format order
    // Format: - [Quantity]x [Product Name] ([Design Code/SKU]) ([Phone Model])
    // Example: - 1x Telefon Kilifi (KOD-123) (iPhone 16 Pro Max)
    function copyOrderToClipboard(qty, productName, code, model) {
        // Clean values
        qty = qty || "1";
        productName = productName ? productName.trim() : "Telefon Kilifi";
        code = code ? code.trim() : "KOD-YOK";
        model = model ? model.trim() : "Bilinmeyen Model";

        const formatted = `- ${qty}x ${productName} (${code}) (${model})`;
        GM_setClipboard(formatted);
        showToast(`Sipariş kopyalandı:\n${formatted}\n\nDexter uygulamasında Ctrl+V yapabilirsiniz!`);
    }

    // 1. SHOPIER PARSER
    function initShopier() {
        setInterval(() => {
            const rows = document.querySelectorAll('tr[id^="orderRow_"], .order-item, .showroom-order-row');
            rows.forEach(row => {
                if (row.classList.contains('dexter-injected')) return;
                row.classList.add('dexter-injected');

                // Try to find a place to put the button
                const actionCell = row.querySelector('td:last-child, .actions, .order-actions');
                if (!actionCell) return;

                const btn = document.createElement('button');
                btn.innerText = 'Dexter Siparişi Kopyala';
                btn.style.cssText = 'background:#0071E3;color:white;border:none;padding:5px 10px;border-radius:4px;font-size:11px;margin-left:5px;cursor:pointer;font-family:sans-serif;font-weight:bold;';
                
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Parse Shopier row
                    // Quantity
                    let qty = "1";
                    const qtyEl = row.querySelector('.qty, .adet, td:nth-child(3)'); // typical quantity position
                    if (qtyEl) {
                        const m = qtyEl.innerText.match(/\d+/);
                        if (m) qty = m[0];
                    }

                    // Product Title & Options (e.g. Design Code, Model)
                    let productName = "Telefon Kilifi";
                    let code = "KOD-YOK";
                    let model = "Bilinmeyen Model";

                    const descEl = row.querySelector('.product-name, .urun-adi, td:nth-child(2)');
                    if (descEl) {
                        const fullText = descEl.innerText;
                        productName = fullText.split('\n')[0].trim();
                        
                        // Parse options (usually model and design code are in parenthesis or metadata options)
                        // Example: "Kişiye Özel Kılıf (iPhone 16 Pro Max - Tasarım: KOD-542)"
                        const optionsMatch = fullText.match(/\(([^)]+)\)/);
                        if (optionsMatch) {
                            const opts = optionsMatch[1];
                            // Try to split by dash/comma/space
                            const parts = opts.split(/[-|,]/);
                            if (parts.length >= 2) {
                                model = parts[0].trim();
                                code = parts[1].replace(/Tasarım|Kod|SKU/gi, '').replace(':', '').trim();
                            } else {
                                model = opts.trim();
                            }
                        }
                    }

                    copyOrderToClipboard(qty, productName, code, model);
                });

                actionCell.appendChild(btn);
            });
        }, 1000);
    }

    // 2. SHOPIFY PARSER
    function initShopify() {
        setInterval(() => {
            const detailCard = document.querySelector('.Polaris-CardSection_12gvu, .Polaris-Card__Section, [class*="OrderDetails"]');
            if (detailCard && !detailCard.classList.contains('dexter-injected')) {
                detailCard.classList.add('dexter-injected');

                const header = document.querySelector('.Polaris-Page-Header__TitleWrapper, [class*="Header"]');
                if (header) {
                    const btn = document.createElement('button');
                    btn.innerText = '⚡ Dexter Siparişlerini Çek';
                    btn.style.cssText = 'background:#0071E3;color:white;border:none;padding:8px 14px;border-radius:18px;font-size:12px;cursor:pointer;font-family:sans-serif;font-weight:bold;margin:10px;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
                    
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const items = document.querySelectorAll('.Polaris-ResourceItem, tr.Polaris-IndexTable__Row, [class*="LineItem"]');
                        let compiledText = "";

                        items.forEach(item => {
                            let title = "Telefon Kilifi";
                            let qty = "1";
                            let model = "Bilinmeyen Model";
                            let code = "KOD-YOK";

                            const titleEl = item.querySelector('[class*="ProductTitle"], .Polaris-ResourceItem__Title, td:nth-child(2)');
                            if (titleEl) title = titleEl.innerText.split('\n')[0].trim();

                            const qtyEl = item.querySelector('[class*="Quantity"], td:nth-child(3)');
                            if (qtyEl) {
                                const m = qtyEl.innerText.match(/\d+/);
                                if (m) qty = m[0];
                            }

                            const skuEl = item.querySelector('[class*="Sku"], .sku, .Polaris-TextStyle--variationSubdued');
                            if (skuEl) {
                                code = skuEl.innerText.replace(/SKU|Kod/gi, '').replace(':', '').trim();
                            }

                            const variantEl = item.querySelector('[class*="VariantTitle"], .Polaris-TextStyle--variationSubdued');
                            if (variantEl) {
                                const text = variantEl.innerText;
                                const m = text.match(/(iPhone\s+\d+\s*\w*\s*\w*)/i);
                                if (m) {
                                    model = m[1].trim();
                                }
                            }

                            compiledText += `- ${qty}x ${title} (${code}) (${model})\n`;
                        });

                        if (compiledText) {
                            GM_setClipboard(compiledText.trim());
                            showToast(`Shopify siparişleri kopyalandı!\n\nDexter uygulamasında Ctrl+V yapabilirsiniz.`);
                        } else {
                            showToast('Sipariş öğesi bulunamadı! Lütfen sipariş detay sayfasında olduğunuzdan emin olun.');
                        }
                    });

                    header.appendChild(btn);
                }
            }
        }, 1500);
    }

    const url = window.location.href;
    if (url.includes('shopier.com')) {
        initShopier();
    } else if (url.includes('shopify.com')) {
        initShopify();
    }
})();
