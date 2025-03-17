<%@ include file="init.jsp" %>

<title>Корпоративный портал</title>

<div id="root"></div>
<script type="module" crossorigin src="<%=request.getContextPath()%>/dist/index.js"></script>
<link rel="stylesheet" crossorigin href="<%=request.getContextPath()%>/dist/index.css">

<portlet:resourceURL var="downloadURL">
    <portlet:param name="file_id" value="id" />
    <portlet:param name="p_p_resource_id" value="downloadFile" />
</portlet:resourceURL>

<script>
    var reactMvcPortlet = {
        portletNamespace: '<portlet:namespace />',
        downloadFullURL: '${downloadURL}'
    };
</script>
