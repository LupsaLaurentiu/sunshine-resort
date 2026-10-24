package com.sunshine.resort.tv;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.webkit.WebViewAssetLoader;
import java.io.ByteArrayInputStream;

/** Local TV interface; all reservation authorization remains with the existing API. */
public final class MainActivity extends Activity {
    private static final String ORIGIN = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + ORIGIN + "/assets/index.html";
    private WebView web;
    private boolean resumed;

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        hideSystemBars();
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(8, 9, 8));
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setTextZoom(100);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.addJavascriptInterface(new ExitBridge(), "SunshineAndroid");

        WebViewAssetLoader assets = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (isLocal(uri)) {
                    WebResourceResponse response = assets.shouldInterceptRequest(uri);
                    if (response != null) return response;
                    return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                            java.util.Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
                }
                return null;
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                // The native bridge must never be exposed to a remote webpage.
                return !isLocal(request.getUrl());
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (START_URL.equals(url)) lifecycle(resumed ? "visible" : "hidden");
            }
        });
        setContentView(web);
        web.setFocusableInTouchMode(true);
        web.requestFocus();
        web.loadUrl(START_URL);
    }

    private static boolean isLocal(Uri uri) {
        return "https".equals(uri.getScheme()) && ORIGIN.equals(uri.getHost())
                && uri.getPort() == -1 && uri.getPath() != null
                && uri.getPath().startsWith("/assets/");
    }

    private void hideSystemBars() {
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }

    private void lifecycle(String state) {
        if (web != null) web.evaluateJavascript(
                "window.dispatchEvent(new CustomEvent('sunshine:android-lifecycle',{detail:'"
                        + state + "'}));", null);
    }

    @Override
    public void onResume() {
        super.onResume();
        resumed = true;
        hideSystemBars();
        if (web != null) { web.onResume(); web.resumeTimers(); lifecycle("visible"); }
    }

    @Override
    public void onPause() {
        resumed = false;
        lifecycle("hidden");
        if (web != null) { web.onPause(); web.pauseTimers(); }
        super.onPause();
    }

    private static String arrow(int code) {
        return switch (code) {
            case KeyEvent.KEYCODE_DPAD_LEFT -> "ArrowLeft";
            case KeyEvent.KEYCODE_DPAD_RIGHT -> "ArrowRight";
            case KeyEvent.KEYCODE_DPAD_UP -> "ArrowUp";
            case KeyEvent.KEYCODE_DPAD_DOWN -> "ArrowDown";
            default -> null;
        };
    }

    private static boolean select(int code) {
        return code == KeyEvent.KEYCODE_DPAD_CENTER || code == KeyEvent.KEYCODE_ENTER
                || code == KeyEvent.KEYCODE_NUMPAD_ENTER;
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        int code = event.getKeyCode();
        String key = arrow(code);
        if (web != null && (key != null || code == KeyEvent.KEYCODE_BACK)) {
            if (event.getAction() == KeyEvent.ACTION_DOWN
                    && (code != KeyEvent.KEYCODE_BACK || event.getRepeatCount() == 0))
                web.evaluateJavascript("document.dispatchEvent(new KeyboardEvent('keydown',{key:'"
                        + (key != null ? key : "Escape") + "',bubbles:true,cancelable:true}));", null);
            return true;
        }
        if (web != null && select(code)) {
            if (event.getAction() == KeyEvent.ACTION_UP)
                web.evaluateJavascript("(()=>{const b=document.activeElement;"
                        + "if(b instanceof HTMLButtonElement&&!b.disabled)b.click()})()", null);
            return true;
        }
        return super.dispatchKeyEvent(event);
    }

    @Override
    public void onDestroy() {
        if (web != null) {
            web.removeJavascriptInterface("SunshineAndroid");
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    public final class ExitBridge {
        @JavascriptInterface
        public void closeApp() {
            runOnUiThread(() -> { lifecycle("hidden"); finish(); });
        }
    }
}
