chrome.commands.onCommand.addListener(async (command) => {
    try{
        switch(command){
            case "toggle-extension": {
                const { pushItEnabled } = await chrome.storage.local.get({
                    pushItEnabled: true
                })

                const newState = !pushItEnabled

                await chrome.storage.local.set({
                    pushItEnabled: newState
                })

                break;
            }
            case "toggle-page-lock": {
                const { pushItEnabled, pushItPageLocked } = await chrome.storage.local.get({
                    pushItEnabled: true,
                    pushItPageLocked: false
                }) 

                const newState = !pushItPageLocked

                await chrome.storage.local.set({
                    pushItPageLocked: newState
                })

                break;
            }
        }
    }catch(e){
        console.error("Erro ao executar atalho: ", e)
    }
})