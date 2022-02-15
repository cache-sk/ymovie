package cz.streamcinema.ymovie.wrapper;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import androidx.annotation.RequiresApi;
import androidx.webkit.WebViewAssetLoader;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.RelativeLayout;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import org.json.JSONObject;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import cz.streamcinema.ymovie.wrapper.BuildConfig;

public class MainActivity extends Activity {
    private final static String UPDATE_URL = "https://api.github.com/repos/cache-sk/ymovie/releases";
    private final static String HOME_URL = "file:///android_asset/tv.html";
    private final static String UA_PREFIX = "Ymovie ";
    private final static String YMOVIE_HOST = "ymovie.streamcinema.cz";
    private final static String JS_OBJECT = "YmovieWrapper";
    private final static String BACK_CLICK_SCRIPT =
            "(function() { document.dispatchEvent(new KeyboardEvent(\"keydown\",{code: \"Escape\", key: \"Escape\", keyCode:27}));})();";
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("E, dd MMM yyyy kk:mm:ss", Locale.US);
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
        this.webView.addJavascriptInterface(new YmovieWrapperJavascriptInterface(), JS_OBJECT);
        this.webView.setWebViewClient(new WebViewClient());
        WebSettings webSettings = this.webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setUserAgentString(UA_PREFIX+webSettings.getUserAgentString());

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClient() {
            @RequiresApi(api = Build.VERSION_CODES.N)
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                //override CORS - get content here, not in WebView
                if (request.getUrl().getHost().equals(YMOVIE_HOST)) {
                    WebResourceResponse response = null;
                    try {
                        URL url = new URL(request.getUrl().toString());
                        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                        conn.setUseCaches(false);
                        conn.setRequestMethod(request.getMethod());
                        request.getRequestHeaders().forEach((key, value) -> {
                            if (null != key && null != value) {
                                conn.setRequestProperty(key, value);
                            }
                        });
                        conn.setRequestProperty("cache-control","no-cache");
                        conn.setRequestProperty("pragma","no-cache");
                        conn.connect();

                        InputStream data;
                        if (conn.getResponseCode() / 100 == 2) {
                            data = conn.getInputStream();
                        }
                        else {
                            data = conn.getErrorStream();
                        }

                        Map<String,String> headers = conn.getHeaderFields().entrySet().stream()
                                .filter(e -> null != e.getKey() && null != e.getValue()).collect(
                                Collectors.toMap(
                                        e -> e.getKey(),
                                        e -> e.getValue().iterator().next()
                                )
                        );

                        //here is that hack
                        headers.put("Access-Control-Allow-Origin","*");
                        headers.put("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");

                        response = new WebResourceResponse(conn.getContentType(), conn.getContentEncoding(),
                                conn.getResponseCode(), conn.getResponseMessage(), headers, data);
                        return response;
                    } catch (IOException e) {
                        //ignore and skip
                    }
                }
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }
        });

        this.webView.loadUrl(HOME_URL);
        main.addView(this.webView);
    }

    @Override
    public void onStart(){
        super.onStart();
        //version check
        //BuildConfig.VERSION_CODE;
        final RequestQueue queue = Volley.newRequestQueue(this);
        JsonObjectRequest request = new JsonObjectRequest(UPDATE_URL, null,
            new Response.Listener<JSONObject>() {
                @Override
                public void onResponse(JSONObject response) {
                    if (null != response) {
                        System.out.println(response.toString());
                    }
                }
            }, new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    //ignore?
                }
            });
        queue.add(request);
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
            webView.evaluateJavascript(BACK_CLICK_SCRIPT, new ValueCallback<String>() {
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
