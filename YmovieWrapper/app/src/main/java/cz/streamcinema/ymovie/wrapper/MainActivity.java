package cz.streamcinema.ymovie.wrapper;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.KeyEvent;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.RelativeLayout;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        RelativeLayout main = (RelativeLayout) findViewById(R.id.main_layout);
        this.webView = new WebView(main.getContext());
        this.webView.setLayoutParams(
                new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.MATCH_PARENT,
                        RelativeLayout.LayoutParams.MATCH_PARENT));
        this.webView.addJavascriptInterface(new YmovieWrapperJavascriptInterface(), "YmovieWrapper");
        this.webView.setWebViewClient(new WebViewClient());
        WebSettings webSettings = this.webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setUserAgentString("Ymovie "+webSettings.getUserAgentString());
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        this.webView.loadUrl("file:///android_asset/tv.html");
        main.addView(this.webView);
    }

    public class YmovieWrapperJavascriptInterface {
         @JavascriptInterface
        public void play(String url, String title) {
            try {
                int vlcRequestCode = 42;
                Uri uri = Uri.parse(url);
                Intent vlcIntent = new Intent(Intent.ACTION_VIEW);
                vlcIntent.setPackage("org.videolan.vlc");
                vlcIntent.setDataAndTypeAndNormalize(uri, "video/*");
                vlcIntent.putExtra("title", title);
                startActivityForResult(vlcIntent, vlcRequestCode);
            } catch (ActivityNotFoundException ex) {
                new AlertDialog.Builder(MainActivity.this)
                    .setTitle(R.string.app_name)
                    .setMessage(R.string.you_need_vlc)
                    .setNeutralButton(R.string.okay, new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.dismiss();
                        }
                    })
                    .show();
            }
        }

        @JavascriptInterface
        public void quit(){
            new AlertDialog.Builder(MainActivity.this)
                .setIcon(android.R.drawable.ic_dialog_alert)
                .setTitle(R.string.app_name)
                .setMessage(R.string.really_quit)
                .setPositiveButton(R.string.yes, new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int which) {
                        //Stop the activity
                        finishAndRemoveTask();
                        System.exit(0);
                    }
                })
                .setNegativeButton(R.string.no, null)
                .show();
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if(keyCode == KeyEvent.KEYCODE_BACK) {
            //prevent back button quit and propagate esc for webview
            webView.evaluateJavascript("(function() { document.dispatchEvent(new KeyboardEvent(\"keydown\",{code: \"Escape\", key: \"Escape\", keyCode:27}));})();", new ValueCallback<String>() {
                @Override
                public void onReceiveValue(String value) {
                }
            });
            return true;
        } else {
            return super.onKeyDown(keyCode, event);
        }
    }
}
