调用方式二：标准API（推荐）
特点
支持完整的参数配置
更精确的控制选项
适合生产环境使用
完整示例
import http.client
import json

# 配置参数
def generate_image_with_full_params():
    # 必填参数
    PROMPT = "https://tuziai.oss-cn-shenzhen.aliyuncs.com/style/default_style_small.png 让这个女人带上墨镜，衣服换个颜色"

    # 可选参数
    payload_data = {
        "model": "flux-kontext-pro",
        "prompt": PROMPT,
        "aspect_ratio": "16:9",        # 图像宽高比
        "output_format": "png",        # 输出格式
        "safety_tolerance": 2,         # 安全容忍度
        "prompt_upsampling": False     # 提示上采样
    }

    # 可选：添加种子以获得可重复结果
    # payload_data["seed"] = 42

    # 可选：添加输入图像（Base64编码）
    # payload_data["input_image"] = "base64_encoded_image_string"

    conn = http.client.HTTPSConnection("api.tu-zi.com")

    payload = json.dumps(payload_data, ensure_ascii=False).encode('utf-8')

    headers = {
       'Authorization': 'Bearer your-key',
       'Content-Type': 'application/json; charset=utf-8'
    }

    try:
        conn.request("POST", "/v1/images/generations", payload, headers)
        res = conn.getresponse()
        data = res.read()

        print("API响应:")
        print(data.decode("utf-8"))

    except Exception as e:
        print(f"请求失败: {e}")
    finally:
        conn.close()

# 调用函数
generate_image_with_full_params()
Messages格式
{"data":[{"url":"https://fal.media/files/penguin/W7Sp0uVYy-YhXHU1mubri_61c8f15b665444ecac763a61eeffe05b.png"}],"created":1748915064}
标准API参数详解
必填参数
参数	类型	说明	示例
model	string	模型名称	"flux-kontext-pro"
prompt	string	文本提示，可包含图片URL	"一只可爱的猫咪"
可选参数
参数	类型	默认值	说明	示例
input_image	string	null	Base64编码的输入图像（暂时不支持）	"data:image/jpeg;base64,..."
seed	integer	null	随机种子，用于可重复生成	42
aspect_ratio	string	"1:1"	图像宽高比	"16:9", "1:1", "9:16"
output_format	string	"jpeg"	输出格式	"jpeg", "png"
webhook_url	string	null	Webhook通知URL	"https://your-webhook.com"
webhook_secret	string	null	Webhook签名密钥	"your-secret-key"
prompt_upsampling	boolean	false	是否对提示进行上采样	true, false
safety_tolerance	integer	2	安全容忍度级别(0-6)	0(最严格) - 6(最宽松)
宽高比选项
支持的宽高比范围在 21:9 到 9:21 之间，常用选项：

"21:9" - 超宽屏
"16:9" - 宽屏
"4:3" - 标准屏幕
"1:1" - 正方形
"3:4" - 竖屏
"9:16" - 手机竖屏
"9:21" - 超长竖屏
使用技巧
1. 图像参考使用
在提示中可以直接包含图片URL：

prompt = "https://example.com/image.jpg 让这个人穿上红色衣服"
涉及多图的，按下列格式放入提示词即可（即URL按顺序放置在最前端，用空格隔开）

prompt=" https://tuziai.oss-cn-shenzhen.aliyuncs.com/style/default_style_small.png   https://tuziai.oss-cn-shenzhen.aliyuncs.com/small/4-old.png  Please replace the girl in P2 with the girl from P1."
2. 种子使用
使用相同的种子和提示可以生成相似的图像：

payload_data = {
    "model": "flux-kontext-pro",
    "prompt": "一只蓝色的猫",
    "seed": 12345  # 固定种子
}
3. 安全容忍度调整
0-2: 严格模式，适合商业用途
3-4: 平衡模式，适合一般用途
5-6: 宽松模式，创意内容