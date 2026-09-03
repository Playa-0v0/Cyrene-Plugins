# 天气查询（weather-tool）

查询指定城市的当前天气。优先使用用户配置的 OpenWeather API 密钥；未配置时自动降级到免密钥的 Open-Meteo。

## 使用方式

启用插件后，直接对昔涟说「查一下上海的天气」即可触发工具。

## 配置（可选）

- 提供了 OpenWeather 密钥时走 OpenWeather API，精度更高
- 密钥通过昔涟对话中的密钥卡片安全存储，不需要手动配置文件
- 未配置密钥时自动使用 Open-Meteo，无需任何配置

## 行为说明

- 访问网络：OpenWeather（api.openweathermap.io）或 Open-Meteo（api.open-meteo.com）
- 记住上次查询的城市，下次直接说「天气」即可
- 源码：[Cyrene-Agent 示例](https://github.com/Playa-0v0/Cyrene-Agent/tree/master/examples/weather-tool)
